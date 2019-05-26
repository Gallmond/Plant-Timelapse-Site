# Viewer Plant Timelapse

Viewer for plant timelapse images.

----

Super simple web interface for viewing images taken and uploaded to S3 by the pi plant timelapse camera.

![Viewer gif](/plant_scroll.gif)

## Technologies

- Node.js
	- aws-sdk
	- ejs
	- express
- EC2 (Linux)
	- PM2

## Lanuch

Deployed to EC2 instance.
Installed node modules.
Started and monitored with [pm2](http://pm2.keymetrics.io/).