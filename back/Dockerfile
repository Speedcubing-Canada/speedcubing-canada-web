FROM python:3.12 AS builder

ENV FLASK_APP=backend
ENV FLASK_DEBUG=1
ENV FLASK_RUN_PORT=8083
ENV FLASK_RUN_HOST=0.0.0.0

WORKDIR /workdir

COPY requirements.txt /workdir

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8083

ENTRYPOINT ["gunicorn"]
CMD ["-b", "0.0.0.0:8083", "backend:app"]