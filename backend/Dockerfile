FROM python:3.11-alpine AS builder

ENV FLASK_APP biblio
ENV FLASK_DEBUG 1
ENV FLASK_RUN_PORT 8000
ENV FLASK_RUN_HOST 0.0.0.0

WORKDIR /workdir

COPY requirements.txt /workdir

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["flask", "run"]