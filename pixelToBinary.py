#!/usr/local/bin/python3
from PIL import Image
import numpy
import cv2
import sys


def pixelToBinary(text, width, height, tolarance):
    # Open Paddington
    img = Image.open(text).convert('RGB')

    # Resize smoothly down to 40x40 pixels
    imgSmall = img.resize((width, height), resample=Image.BILINEAR)

    # Save
    # imgSmall.save('result.png')

    # Convert RGB to BGR
    open_cv_image = numpy.array(imgSmall)
    originalImage = open_cv_image[:, :, ::-1].copy()

    grayImage = cv2.cvtColor(originalImage, cv2.COLOR_BGR2GRAY)

    #   Terminate if maximum trial is applied but there isno change = image is not suitable or one gray color domamint: b/w ratio changes rapidly for one trial...
    (thresh, blackAndWhiteImage) = cv2.threshold(
        grayImage, tolarance, 255, cv2.THRESH_BINARY)

    # print the convertion result
    rows, cols = blackAndWhiteImage.shape
    for i in range(rows):
        for j in range(cols):
            k = blackAndWhiteImage[i, j]
            if k == 255:
                k = 1
            print(k)


# local initials (if no value is given).
# tolarance= how much tolarence needed for the b/w ratio :: tolarence needs to be high for the detailed conversion , default tolarence = 57
width = 40
height = 40
tolarance = 57

# run the code with initial sys arguements
try:
    if len(sys.argv) > 2:
        try:
            width = int(sys.argv[2])
        except:
            # if not int (dunno why)
            width = 40

    if len(sys.argv) > 3:
        try:
            height = int(sys.argv[3])
        except:
            # if not int (dunno why)
            height = 40
    if len(sys.argv) > 4:
        try:
            tolarance = int(sys.argv[4])
        except:
            # if not int (dunno why)
            tolarance = 57
except:
    width = 40
    height = 40
    tolarance = 127

pixelToBinary(sys.argv[1], width, height, tolarance)
