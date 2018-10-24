#!/usr/bin/env python3
# coding=utf-8

from base64 import b64encode
import tempfile
import subprocess
import os
import stat
from pathlib import Path
import random
import shutil
import string

from binpatch import parse_patch, patch, PatchError


RECIPES_DIR = Path('./recipes/').resolve()
with open('banner.txt', 'rb') as banner_file:
    BANNER = banner_file.read().decode('utf-8')


def ask_file_selection(prompt, base_dir):
    print()
    print(prompt)

    current_dir = base_dir
    # loop until a file is selected to allow recursing into directories
    while True:
        # list the current dir
        print('Category: {}'.format(current_dir.name))
        file_list = list(sorted(current_dir.iterdir()))
        if current_dir != base_dir:
            # provide the option to go up if we are in a sub-dir
            print('- ..')
        for f in file_list:
            print('- {}{}'.format(f.name, '...' if f.is_dir() else ''))

        # loop until something correct has been entered
        while True:
            answer = input('> ')
            selection = Path(current_dir, answer)

            # the selection must exist
            if not selection.exists():
                print(random.choice(['What?', 'Huh?', 'Never heard of that...', '???']))
            
            if selection.is_file():
                return selection.resolve()
            elif selection.is_dir():
                # recurse!
                current_dir = selection.resolve()
                break


def ask_selection(prompt, options):
    print()
    print(prompt)
    for i, option in enumerate(options):
        print('{}  {}'.format(i + 1, option[1]))

    while True:
        try:
            answer = int(input('> '))
            if answer >= 1 and answer <= len(options):
                return options[answer - 1][0]
        except ValueError:
            pass


def ask_yes_no(prompt):
    print()

    # loop until something correct has been entered
    while True:
        choice = input(prompt + ' [y/n] > ')
        if choice in ['y', 'n']:
            return choice == 'y'


def ask_text(prompt):
    print()
    print(prompt)
    print('(Use an empty line to indicate you are done)')
    
    # loop until something correct has been entered
    text = ''
    while True:
        line = input('> ')
        if line == '':
            return text
        text += line + '\n'


def take_special_request():
    max_changes = 21

    # loop until something correct has been entered
    while True:
        special_request_text = ask_text("Tell me about it, so I can change the recipe accordingy:")
        try:
            # parse it
            changes = parse_patch(special_request_text)
        except PatchError as e:
            print('Oops! There is something wrong with your special request!')
            print(e.message)
            print('Try again.')
            continue

        if len(changes) > max_changes:
            print("Thats a bit much, I don't think I will do all of that...")
            changes = changes[:max_changes]

        # leave out the non-printable chars
        allowed = string.printable.encode('ascii')
        is_printable = lambda c: (c[2] in allowed)
        printable_changes = list(filter(is_printable, changes))

        if len(changes) != len(printable_changes):
            print("I couldn't write down everything, but I'll try my best!")

        return changes


def take_order():
    print(BANNER)
    print('Welcome to the Petite Prison bar, where you can mix your drinks yourself!')
    print()

    # select the drink
    drink_blacklist = ['Fruity Light-Absorbing Gin']
    while True:
        selection = ask_file_selection('What would you like to order?', RECIPES_DIR)

        if selection.name in drink_blacklist:
            print('Unfortunately, we are not allowed to sell it anymore, too many casualties.')
            print("I still don't know what to do with the one I have in the back...")
        else:
            drink = selection
            break

    # select who mixes
    who_mixes = ask_selection('Who should mix the drink?', [
        ('self', 'let me give it a try'),
        ('bartender', "I'm soooo bad at that"),
    ])

    # special requests
    if who_mixes == 'bartender' and ask_yes_no('Any special requests?'):
        special_request = take_special_request()
    else:
        special_request = None

    return drink, special_request, who_mixes


def get_recipe(drink):
    recipe_file = str(drink)
    with open(recipe_file, 'rb') as f:
        recipe = f.read()

    return recipe


def change_recipe(recipe, changes):
    return patch(recipe, changes)


def mix_drink(recipe):
    # tmpdir and everything in it will be deleted when leaving the with-scope
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpfile, tmpfile_path = tempfile.mkstemp(dir=tmpdir)
        
        # chmod u-r tmpfile (to avoid leaking solutions)
        st = os.stat(tmpfile)
        os.chmod(tmpfile, st.st_mode & (~stat.S_IRUSR))

        # write the recipe
        os.write(tmpfile, recipe)

        # chgrp prison tmpfile
        shutil.chown(tmpfile, group='prison')
        
        # chmod g+rx tmpfile
        st = os.stat(tmpfile)
        os.chmod(tmpfile, st.st_mode | stat.S_IRGRP | stat.S_IXGRP)
        
        # chmod g+x tmpdir (needed so tmpfile can be run in it)
        st_tmpdir = os.stat(tmpdir)
        os.chmod(tmpdir, st_tmpdir.st_mode | stat.S_IXOTH)

        # close tmpfile so it can be run
        os.close(tmpfile)

        # execute it, but safety first!
        cmd = [
            'sudo', '-u', 'prison', '-g', 'prison',
            './minijail-recipe-executor.sh',
            tmpfile_path
        ]
        try:
            subprocess.run(cmd, timeout=2)
        except subprocess.TimeoutExpired:
            pass


def give_recipe(drink):
    recipe = get_recipe(drink)
    print('Alright, good luck! Here is the recipe:')
    print(b64encode(recipe).decode('ascii'))


def fulfill_order(drink, special_request):
    # check if that's a legit recipe
    if not str(drink.resolve()).startswith(str(RECIPES_DIR) + os.sep):
        print("I'm sorry but thats not a recipe...")
        return

    recipe = get_recipe(drink)
    if special_request is not None:
        recipe = change_recipe(recipe, special_request)

    print("Here's your {}:".format(drink.name), flush=True)
    mix_drink(recipe)


def main():
    drink, special_request, who_mixes = take_order()
    print()

    if who_mixes == 'self':
        give_recipe(drink)
    else:
        fulfill_order(drink, special_request)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Bye!')
        pass
