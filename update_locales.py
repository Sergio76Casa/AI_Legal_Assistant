
import json
import os

files = [
    ('c:/Users/USER/Desktop/Proyectos Antigravity/Legal/src/locales/es.json', {
        "title": "Programa de Afiliados",
        "description": "Gana un 30% recurrente recomendando nuestra plataforma a profesionales y empresas.",
        "join_btn": "Solicitar ser Afiliado",
        "pending_approval": "Tu solicitud está siendo revisada.",
        "dashboard_title": "Panel de Afiliado",
        "your_link": "Tu Enlace Único",
        "copy_btn": "Copiar",
        "copied": "¡Copiado!",
        "stats": {
            "clicks": "Clics en tu enlace",
            "registrations": "Registros totales",
            "paid_customers": "Clientes de pago"
        },
        "balance": {
            "title": "Tus Ganancias",
            "earned": "Comisiones acumuladas",
            "pending": "Saldo pendiente"
        },
        "customize_code": "Personalizar Código",
        "customize_hint": "Puedes personalizar tu código una sola vez.",
        "save": "Guardar"
    }),
    ('c:/Users/USER/Desktop/Proyectos Antigravity/Legal/src/locales/en.json', {
        "title": "Affiliate Program",
        "description": "Earn 30% recurring by recommending our platform to professionals and businesses.",
        "join_btn": "Apply to be an Affiliate",
        "pending_approval": "Your application is being reviewed.",
        "dashboard_title": "Affiliate Dashboard",
        "your_link": "Your Unique Link",
        "copy_btn": "Copy",
        "copied": "Copied!",
        "stats": {
            "clicks": "Clicks on your link",
            "registrations": "Total registrations",
            "paid_customers": "Paid customers"
        },
        "balance": {
            "title": "Your Earnings",
            "earned": "Accumulated commissions",
            "pending": "Pending balance"
        },
        "customize_code": "Customize Code",
        "customize_hint": "You can customize your code only once.",
        "save": "Save"
    }),
    ('c:/Users/USER/Desktop/Proyectos Antigravity/Legal/src/locales/ru.json', {
        "title": "Партнерская программа",
        "description": "Зарабатывайте 30% ежемесячно, рекомендуя нашу платформу профессионалам и компаниям.",
        "join_btn": "Стать партнером",
        "pending_approval": "Ваша заявка находится на рассмотрении.",
        "dashboard_title": "Панель партнера",
        "your_link": "Ваша уникальная ссылка",
        "copy_btn": "Копировать",
        "copied": "Скопировано!",
        "stats": {
            "clicks": "Клики по ссылке",
            "registrations": "Всего регистраций",
            "paid_customers": "Платящие клиенты"
        },
        "balance": {
            "title": "Ваш заработок",
            "earned": "Накопленные комиссии",
            "pending": "Ожидает выплаты"
        },
        "customize_code": "Изменить код",
        "customize_hint": "Вы можете изменить код только один раз.",
        "save": "Сохранить"
    })
]

for path, data in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = json.load(f)
    content['affiliate'] = data
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=4)
    print(f"Updated {os.path.basename(path)}")
