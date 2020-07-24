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

    (thresh, blackAndWhiteImage) = cv2.threshold(
        grayImage, 127, 255, cv2.THRESH_BINARY)

    # prevent infinite loops,
    max = tolarance*1.5

    # too dark or too brigth
    threshold = 127
    # while b/w ratio is not good continue to improve it,
    #   Terminate if tolarance is reached.
    #   Terminate if maximum trial is applied but there isno change = image is not suitable or one gray color domamint: b/w ratio changes rapidly for one trial...
    while (threshold > 127-tolarance and threshold < 127+tolarance) and (blackAndWhiteImage.sum() < (width*height*255*/4) or blackAndWhiteImage.sum() > width*height*255*3/4) and (max > 0):
        (thresh, blackAndWhiteImage) = cv2.threshold(
            grayImage, threshold, 255, cv2.THRESH_BINARY)
        if blackAndWhiteImage.sum() < 102000:
            threshold -= 1
        elif blackAndWhiteImage.sum() > 306000:
            threshold += 1
        max -= 1

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
    tolarance = 57

pixelToBinary(sys.argv[1], width, height, tolarance)
