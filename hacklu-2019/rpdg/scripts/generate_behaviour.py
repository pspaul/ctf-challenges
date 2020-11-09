#!/usr/bin/env python

import sys
import random
try:
    from bcrypt import hashpw, gensalt
except:
    print('Please pip install bcrypt')
    exit(1)

from generate_password import generate_password_from_file

# Time range in milli seconds
RANGE_SLOW = [400, 500]
RANGE_FAST = [100, 200]


# Splits the password into bigrams
def learn_password(password):
    return [char_a + char_b for char_a, char_b in zip(password[:-1], password[1:])]


def range_normal_variate(start, end):
    mid = (start + end) / 2
    return round(random.normalvariate(mid, mid * 0.1))


def annotate_text(learned, text):
    if len(text) == 0:
        return

    # normalize
    text = text.replace('\n', ' ')

    # start at t=0
    annotated = []
    time_offset = 0
    annotated.append((text[0], time_offset))

    for prev_char, curr_char in zip(text[:-1], text[1:]):
        bigram = prev_char + curr_char
        if bigram in learned:
            start, end = RANGE_FAST
        else:
            start, end = RANGE_SLOW
        delta = range_normal_variate(start, end)
        time_offset += delta
        annotated.append((curr_char, time_offset))

    return annotated


def annotate_file(password, input_file):
    with open(input_file, 'rb') as f:
        content = f.read().decode(encoding='utf-8', errors='ignore')
    
    learned = learn_password(password)
    annotated = annotate_text(learned, content)

    return annotated
    

def main(input_file, password=None):
    if password is None:
        password = generate_password_from_file(input_file)
    password_hash = hashpw(password, gensalt())

    annotated = annotate_file(password, input_file)
    #print(annotated)
    
    time_start = 1571738400000 # 2019-10-22 10:00:00 UTC
    admin_user_id = 1
    admin_path = "/admin.php"

    print('USE `rpdg`;')
    print()
    print('-- create the admin account')
    print('-- admin:{}'.format(password))
    print('INSERT INTO users (`name`, `pwhash`) VALUES ("admin", "{}");'.format(password_hash))
    print()

    print('INSERT INTO tracking (`key`, `timestamp`, `user`, `path`) VALUES ')
    for key, timestamp in annotated:
        print('("{}", {}, {}, "{}"){}'.format(key, timestamp + time_start, admin_user_id, admin_path, ';' if timestamp == annotated[-1][1] else ','))


if __name__ == "__main__":
    if len(sys.argv) not in [2, 3]:
        print('Usage: {} <textfile> [password]'.format(sys.argv[0]))
        exit(1)

    input_file = sys.argv[1]
    if len(sys.argv) == 3:
        password = sys.argv[2]
    else:
        password = None

    main(input_file, password=password)
