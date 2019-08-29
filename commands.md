# Useful commands

## Starting the server

`sudo nohup node server.js 1> ../log.out 2> ../err.out &`

## Stopping th server

`sudo pkill -f node`

## Forwarding ports

`sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080`
`sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 8080`

## Opening ports

`sudo ufw allow 80`
`sudo ufw allow 443`

## Certbot

`sudo certbot certonly --webroot -w ./public/ -d timeline.wang`
`sudo certbot renew --webroot -w ./public/`

To renew the certificate:

1. Stop the server
2. Start the server using the `local` argument
3. `sudo certbot certonly --webroot -w ./public/ -d timeline.wang`
4. `sudo certbot renew --webroot -w ./public/`
5. Start the server back up normally (without the `local` argument)

