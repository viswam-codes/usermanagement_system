const User=require("../models/userModel");
const bcrypt=require('bcrypt');
const randomstring=require('randomstring');




const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };



const  loadLogin=async(req,res)=>{
    try{
         return res.render('login');

    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    return res.render('login', { message: "Email and password are incorrect" });
                } else {
                    req.session.user_id = userData._id;
                    return res.redirect('/admin/home');
                }
            } else {
                return res.render('login', { message: "Email and password are incorrect" });
            }
        } else {
            return res.render('login', { message: "Email and password are incorrect" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
}


const loadDashboard=async(req,res)=>{
    try{
      const userData= await User.findById({_id:req.session.user_id});
    return res.render('home',{admin:userData});
    }catch(error){
        console.log(error.message);
    }
}

const logout=async(req,res)=>{
    try{
      req.session.destroy();
      return res.redirect('/admin');

    }catch(error){
        console.log(error.message);
    }
}
const adminDashboard=async(req,res)=>{
    try{
       const usersData= await User.find({is_admin:0})
       return res.render('dashboard',{users:usersData});

    }catch(error){
        console.log(error.message);
    }
}

//* Add new user start

const newUserLoad=async(req,res)=>{
    try{
       return res.render('new-user');

    }catch(error){
        console.log(error.message)
    }
}

const addUser=async(req,res)=>{
    try{

        const name=req.body.name;
        const email=req.body.email;
        const mno=req.body.mno;
        const image=req.file.filename;
        const password=randomstring.generate(8);

        const spassword= await securePassword(password)

       const user= new User({
        name:name,
        email:email,
        mobile:mno,
        image:image,
        password:spassword,
        is_admin:0
       });

       const userData= await user.save();


       if(userData){
   
       return res.redirect('/admin/dashboard');

       }else{
       return res.render('new-user',{message:"Something Wrong"});

       }


    }catch(error){
        console.log(error.message)
    }
}

//edit user functionality

const editUserLoad=async(req,res)=>{
    try{
        const id=req.query.id;
        const userData=await User.findById({_id:id});
        if(userData){
          return  res.render('edit-user',{user:userData});

        }else{
           return res.redirect('/admin/dashboard');
        }
        

    }catch(error){
        console.log(error.message);
    }
}

const updateUsers=async(req,res)=>{
   try{
   const userData= await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,is_verified:req.body.verify }})

  return res.redirect('/admin/dashboard');

   }catch(error){
    console.log(error.message)
   }
}

const deleteUser=async(req,res)=>{
    try{
        const id=req.query.id;
        await User.deleteOne({ _id:id });
       return res.redirect('/admin/dashboard');

    }catch(error){
        console.log(error.message)
    }
}


module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser
    
}