# Balloons

Your app and server are running through pm2 (sudo pm2 list)

To stop a service do: sudo pm2 stop serviceName

To start a service do: sudo pm2 start serviceName

/src/serverC.js is the main server file. To change the pops needed for a payout alter line 321

if(popCount % 11 == 0)

So this says if the remainder of popCount Modulus 11 is 0 then payout.

After that is done you will need to restart the server with "sudo pm2 restart serverC"

