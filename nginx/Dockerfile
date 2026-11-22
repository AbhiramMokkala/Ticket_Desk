FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
# Placeholder html page or will be mounted / copied
RUN echo "<html><body><h1>TicketDesk Gateway</h1></body></html>" > /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
