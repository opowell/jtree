import string
import random
from claptcha import Claptcha
from PIL import Image, ImageDraw, ImageFont

number_of_captchas = 10

for i in range(number_of_captchas):
    mystring = ''.join(random.choices(string.ascii_lowercase
                                      + string.digits[1:],  # removed zero becase in the 
                                      k=6))                 # Fira font it has a dot
                                      


    filename = "./captchas/" + mystring + ".png"
    
    c = Claptcha(mystring, "./font/FiraMono-Regular.ttf", size=(300,120), margin=(30,30), 
noise=0, resample=Image.BICUBIC, drawLine = True)

    c.margin = (25,25)
    
    c.write(filename)
