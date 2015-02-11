# Simple Container Benchmarks

Build

```
sudo docker build -t misterbisson/simple-container-benchmarks .
```

Run

```
sudo docker run -d \
-e "SDC_ACCOUNT=$SDC_ACCOUNT" \
-e "SDC_USER=$SDC_USER" \
-e "SDC_URL=$SDC_URL" \
-e "SDC_KEY_ID=$SDC_KEY_ID" \
-e "MANTA_URL=$MANTA_URL" \
-e "MANTA_USER=$MANTA_USER" \
-e "MANTA_SUBUSER=$MANTA_SUBUSER" \
-e "MANTA_KEY_ID=$MANTA_KEY_ID" \
-e "SKEY=`cat ~/.ssh/id_rsa`" \
-e "SKEYPUB=`cat ~/.ssh/id_rsa.pub`" \
-e "DOCKER_HOST=INSERT_IP_HERE" \
misterbisson/simple-container-benchmarks
```