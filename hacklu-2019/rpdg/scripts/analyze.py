#!/usr/bin/env python

from generate_behaviour import annotate_file, annotate_text


def learn_password_bigrams(annotated):
    # pre-processing
    bigram_speeds = {}
    for a, b in zip(annotated[:-1], annotated[1:]):
        bigram = a[0] + b[0]
        delta = b[1] - a[1]

        if len(bigram) != 2:
            print('!2: "{}"'.format(bigram))
            print(a)
            print(b)
        
        if bigram not in bigram_speeds:
            bigram_speeds[bigram] = []
        bigram_speeds[bigram].append(delta)

    # calculate means of bigram speeds
    bigram_means = []
    for bigram, speeds in bigram_speeds.items():
        mean = sum(speeds) / len(speeds)
        bigram_means.append((bigram, mean))

    # sort by mean speeds
    bigram_means_sorted = sorted(bigram_means, key=lambda x: x[1])

    # split at the biggest gap
    max_gap = 0
    max_gap_index = 0
    for i, (a, b) in enumerate(zip(bigram_means_sorted[:-1], bigram_means_sorted[1:])):
        gap = b[1] - a[1]
        if gap > max_gap:
            max_gap = gap
            max_gap_index = i + 1

    # separate the bigrams that are in the password
    bigrams_fast = bigram_means_sorted[:max_gap_index]
    password_bigrams = [x[0] for x in bigrams_fast]
    
    return password_bigrams


def get_password(password_bigrams):
    # prepare bigrams
    next_char_map = {}
    for bigram in password_bigrams:
        #print('"{}"'.format(bigram))
        char_a, char_b = bigram[0], bigram[1]
        next_char_map[char_a] = char_b

    # find the beginning (the bigram that has no matching predecessor)
    start_bigram = None
    for bigram in password_bigrams:
        if bigram[0] not in next_char_map.values():
            start_bigram = bigram
            break

    # if there is no beginning, there is something wrong
    if start_bigram is None:
        print('Could not find start_bigram :/')
        return None

    # reconstruct the password (put all the bigrams together like dominos)
    bigrams_remaining = password_bigrams[:]
    password = start_bigram
    bigrams_remaining.remove(start_bigram)
    while len(bigrams_remaining) > 0:
        last_char = password[-1]
        next_char = next_char_map[last_char]
        password += next_char
        bigrams_remaining.remove(last_char + next_char)

    # voila, the password!
    return password


def reconstruct_password(annotated):
    password_bigrams = learn_password_bigrams(annotated)
    return get_password(password_bigrams)


def main():
    annotated = annotate_file('heim', 'lorem-ipsum.txt')
    print('[+] Reconstructing password...')
    password = reconstruct_password(annotated)
    print('[+] Password: {}'.format(password))


if __name__ == "__main__":
    main()
