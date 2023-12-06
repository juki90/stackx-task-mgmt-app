export default app => {
    app.enableCors({
        origin: '*',
        credentials: true,
        allowedHeaders:
            'Content-Type,Accept,Authorization,X-Auth-Token,Access-Control-Allow-Origin,Access-Control-Expose-Headers'
    });
};
