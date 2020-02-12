# sync-iurix

Date Created: Nov 20, 2019 12:52 PM

## Para correr el container

---

Clonar el repo y dentro del directorio

    git clone https://gitlab.com/notiexpress/sync-iurix.git
    cd sync-iurix

ejecutar el comando:

    docker-compose up

## Descripción gral.

---

El container ejecuta el script `index.js` (cada cierto periodo de tiempo o en el momento en el que se especifique dentro del archivo de configuración `root`) que se encuentra dentro del directorio /scripts. Dicho script verifica la ultima actualización de notificaciones de IURIX y las sincroniza con un directorio local, descargándolas y luego parseandolas a formato JSON.

Para ver los logs generados durante la ejecución del script dentro del container, se puede acceder al archivo `index.log` generado dentro del directorio /var/log/crontest.

Una vez finalizada la ejecución del script, se genera un directorio /notificationsJSON, el cual va a contener todas las notificaciones correspondientes a cada localidad en formato JSON.

## Configuraciones

---

Una vez que esta corriendo el container, va a ejecutar la tarea programada cada 3 minutos teniendo en cuenta el archivo de configuración `root` ubicado en el directorio /cron. Este archivo tiene el siguiente formato:

    */3 * * * * /usr/local/bin/node /home/node/index.js >> /var/log/crontest/index.log 2>&1

### Para modificar el intervalo de tiempo o momento durante el cual se ejecuta la tarea:

Se debe modificar el archivo de configuración, teniendo en cuenta la siguiente estructura/formato:

    # ┌───────────── minute (0 - 59)
    # │ ┌───────────── hour (0 - 23)
    # │ │ ┌───────────── day of month (1 - 31)
    # │ │ │ ┌───────────── month (1 - 12)
    # │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday;
    # │ │ │ │ │                                       7 is also Sunday on some systems)
    # │ │ │ │ │
    # │ │ │ │ │
    # * * * * *  command to execute

Una herramienta online útil que permite visualizar el momento o los periodos de ejecución en base al formato cargado, para una determinada tarea, se encuentra en la web: [http://corntab.com/](http://corntab.com/)
