#!/usr/local/bin/python3
from PIL import Image
import numpy
import cv2
import sys


def pixelToBinary(text, width, height):
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

    # too dark or too brigth
    threshold = 127
    while (threshold > 75 and threshold < 180) and (blackAndWhiteImage.sum() < 102000 or blackAndWhiteImage.sum() > 306000):
        (thresh, blackAndWhiteImage) = cv2.threshold(
            grayImage, threshold, 255, cv2.THRESH_BINARY)
        if blackAndWhiteImage.sum() < 102000:
            threshold -= 1
        elif blackAndWhiteImage.sum() > 306000:
            threshold += 1

    rows, cols = blackAndWhiteImage.shape
    for i in range(rows):
        for j in range(cols):
            k = blackAndWhiteImage[i, j]
            if k == 255:
                k = 1
            print(k)


# run the code with initials

width = 40
height = 40

try:
    if len(sys.argv) > 2:
        width = int(sys.argv[2])
    if len(sys.argv) > 3:
        height = int(sys.argv[3])
except:
    width = 40
    height = 40

pixelToBinary(sys.argv[1], width, height)
