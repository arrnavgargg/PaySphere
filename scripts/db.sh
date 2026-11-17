#!/usr/bin/env bash
# PaySphere PostgreSQL Service Helper

PG_DATA="/home/arnavgarg/.postgres/data"
PG_LOG="/home/arnavgarg/.postgres/logfile"

case "$1" in
    start)
        echo "Starting PostgreSQL..."
        pg_ctl -D "$PG_DATA" -l "$PG_LOG" -o "-k /tmp" start
        pg_isready -h localhost -p 5432
        ;;
    stop)
        echo "Stopping PostgreSQL..."
        pg_ctl -D "$PG_DATA" stop
        ;;
    status)
        pg_ctl -D "$PG_DATA" status
        pg_isready -h localhost -p 5432
        ;;
    restart)
        echo "Restarting PostgreSQL..."
        pg_ctl -D "$PG_DATA" -l "$PG_LOG" -o "-k /tmp" restart
        pg_isready -h localhost -p 5432
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

