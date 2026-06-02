from app import create_app
from app.scheduler import init_scheduler

app = create_app()

if __name__ == '__main__':
    init_scheduler(app)
    app.run(debug=True, use_reloader=False)
