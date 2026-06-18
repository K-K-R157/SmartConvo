import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

const userSchema= new mongoose.Schema({
  fullName:{
    type: String,
    required: true, 
  },
  
  email:{
    type: String,
    required: true,
    unique: true, // Ensures that no two users can have the same email
  },
  password:{
    type: String,
    required: true,
    minlength: 6, // Minimum length for password
  },
  bio:{
    type: String,
    default: '', // Default value if bio is not provided
  },
  profilePic:{
    type: String,
    default: '', // Default value if profilePic is not provided
  },
  nativeLanguage:{
    type: String,
    default: '', // Default value if nativeLanguage is not provided
  },
  learningLanguage:{
    type: String,
    default: '', // Default value if learningLanguage is not provided
  },
  location:{
    type: String,
    default: '', // Default value if location is not provided
  },
  isOnboarded:{
    type: Boolean,
    default: false, // Default value if isOnboarded is not provided
  },
  
  friends:[
    {
      type:mongoose.Schema.Types.ObjectId,  // Reference to the User model  i am using ObjectId to reference the User model ,reference means  here we are storing the id of the user in the friends array
      ref:"User",
    }
  ]

},{timestamps: true});
// This schema is empty, but it will automatically include the fields createdAt, updateAd when timestamps is set to true

// prehook middleware to hash the password before saving the user
userSchema.pre("save", async function(next) {
  if(!this.isModified('password')) return next(); // If the password is not modified, skip hashing
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the generated salt
    next(); // Call the next middleware in the stack
  }
  catch (error) {
    next(error); // If there's an error, pass it to the next middleware
  }
});


userSchema.methods.matchPassword = async function(enteredPassword) {
  const isPasswordCorrect= await bcrypt.compare(enteredPassword, this.password); // Compare the entered password with the hashed password 
  return isPasswordCorrect; // Return true if the passwords match, false otherwise

};
  const User = mongoose.model('User', userSchema);
// This creates a model called User using the schema.

// This User model will be used to interact with the users collection in MongoDB.
// For example, you can use User.create(), User.find(), User.findById(), etc. to interact with the users collection.



export default User;