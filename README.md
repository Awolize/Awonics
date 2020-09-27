# Awonics

Docker-compose will create 3 containers; **PostgreSQL**, **API Server** and a **React front-end**.

## To run:
```root dir$ docker-compose up --build```  
Its recommended to add the flag ```-d``` to *detach* 

## React
+ Port: **80**

## PostgreSQL
+ Port: **5423** (default)  
+ Username: **postgres**  
+ Password: *defined in .env*
