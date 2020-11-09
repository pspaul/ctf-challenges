#!/usr/bin/env python3
# coding=utf-8

import sys
from os.path import abspath
import re


class PatchError(Exception):
    def __init__(self, message):
        self.message = message


def parse_patch(patch_text):
    lines = patch_text.split('\n')
    
    # Parse the changes
    last_pos = -1
    changes = []
    for line in lines:
        m = re.search(r'([ADM]) ([0-9a-fA-F]+)(?: ([0-9a-fA-F]{2}))?', line)
        if m:
            op = m.group(1)
            pos = int(m.group(2), 16)
            if op in ('A', 'M'):
                val = int(m.group(3), 16)
            else:
                val = None

            #print('op={} pos={} val={}'.format(op, pos, val))
            
            if pos < last_pos:
                raise PatchError('The patch must be sorted by position in ascending order!')
            
            changes.append((op, pos, bytes([val])))
            last_pos = pos

    return changes


def patch(input_data, changes):
    output_data = b''
    input_pos = 0
    patch_pos = 0
    output_pos = 0
    wrote = True
    while wrote:
        wrote = False

        #print('in={} out={} patch={}'.format(input_pos, output_pos, patch_pos))

        if patch_pos < len(changes):
            op, pos, val = changes[patch_pos]
            if pos == output_pos:
                if op == 'A':
                    output_data += val
                    output_pos += 1
                    patch_pos += 1
                elif op == 'M':
                    output_data += val
                    output_pos += 1
                    patch_pos += 1
                    input_pos += 1
                else:  # op == 'D'
                    patch_pos += 1
                    input_pos += 1
                wrote = True
        
        if not wrote and input_pos < len(input_data):
            output_data += input_data[input_pos:input_pos+1]
            input_pos += 1
            output_pos += 1
            wrote = True

    return output_data


def patch_files(input_file, output_file, patch_file):
    input_path = abspath(input_file)
    output_path = abspath(output_file)
    patch_path = abspath(patch_file)
    
    if input_path == output_path or patch_path == output_path:
        raise Error('Input file and patch file must not be the output file!')

    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    with open(patch_path, 'rb') as f:
        patch_data = f.read()

    parsed_patch = parse_patch(patch_data.decode('ascii'))
    output_data = patch(input_data, parsed_patch)

    with open(output_path, 'wb') as f:
        f.write(output_data)


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print('Usage: {} <input-file> <output-file> <patch-file>'.format(sys.argv[0]))
        exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    patch_file = sys.argv[3]

    patch_files(input_file, output_file, patch_file)
