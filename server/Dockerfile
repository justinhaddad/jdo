# https://hub.docker.com/r/library/python/tags/
FROM python:3-onbuild

# RUN pip install gunicorn

# Coping source in current directory into the image
# python:3-onbuild expects the source in /usr/src/app
COPY . /usr/src/app

CMD ["gunicorn", "-b", "0.0.0.0:8000", "--reload", "--reload-engine=poll", "app.main"]
