#!/bin/bash

#scp ./hoge.jsx kazunaris@192.168.100.5:/tmp/
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:"  -d @samplesoap.xml -X POST 192.168.100.5:18383
