import os
import random
import string
letters_and_digits =string.ascii_lowercase + string.digits

# input 123456.png
# output R1R2R2R4R5R6.png
# R stands for a random number or a letter

for filename in os.listdir("captchas"):
    filename_splitted = filename.split('.',1)
    filename_basename = filename_splitted[0]
    filename_extension = filename_splitted[1]
    filename_basename_list = list(filename_basename)

    random_chars = random.choices(letters_and_digits, k=len(filename_basename))
    random_chars_begin = random.choices(letters_and_digits, k=4)
    random_chars_end = random.choices(letters_and_digits, k=4)
    newbasename_list = [x for y in zip(random_chars,filename_basename_list) for x in y]
    newbasename_list = random_chars_begin + newbasename_list + random_chars_end
    newbasename = ''.join(newbasename_list)

    new_name = newbasename + "." + filename_extension

    # renaming happens here
    os.rename(os.path.join("captchas",filename), os.path.join("captchas",new_name))
  
    # to decode
    print(new_name[5:-7:2])
