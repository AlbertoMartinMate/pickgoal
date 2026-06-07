from app import create_app
from app.scheduler import init_scheduler

app = create_app()
print('[run] app creada, arrancando scheduler...', flush=True)
init_scheduler(app)  # must be at module level so Gunicorn picks it up
print('[run] scheduler listo', flush=True)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
