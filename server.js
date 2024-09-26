require('dotenv').config({path:'./utils/.env'});
const express=require('express');
const cors = require('cors');
const authrouter=require('./routers/auth-route')
const productRouter=require('./routers/product-route')
const adminRouter=require('./routers/admin_route')
const userRouter=require('./routers/user-route');
const app=express();
const connectdb=require('./utils/db')


app.use(cors())

connectdb();

app.use(express.json())
app.use('/api/auth',authrouter)
app.use('/api/product',productRouter);
app.use('/api/admin',adminRouter);
app.use('/api/user',userRouter);




app.listen(process.env.PORT,()=>{
    console.log("listening to the port");
})