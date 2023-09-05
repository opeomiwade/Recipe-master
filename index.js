import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";


const app = express();
const port = 3000;
const baseUrl = "https://api.spoonacular.com/recipes/";
const myApiKey = process.env.API_KEY;
var title = [];
var instructions = [];
var imageUrl = [];
var ingredients = [];

function getInfo(response){
    response.forEach(recipe => {
        title.push(recipe.title);
        imageUrl.push(recipe.image);
        (recipe.analyzedInstructions).forEach(analyzedInstructions =>{
            let stepArray = [];
            analyzedInstructions.steps.forEach(step => {
                stepArray.push(step.step)
                let ingredientsArr = []
                step.ingredients.forEach(item =>{
                   if(!(ingredients.includes(item.name))){
                    ingredientsArr.push(item.name);
                   }
                });
                ingredients.push(ingredientsArr);
            });
            instructions.push(stepArray);
        })
    });
    return [title, imageUrl , instructions , ingredients];
}



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/" , (req , res) =>{
    res.render("index.ejs" , {year: new Date() .getFullYear()});
    imageUrl = [];
    ingredients = [];
    instructions = [];
    title = []
})

app.get("/chatbot", (req, res) =>{
    console.log(req.body);
    res.send("still cooking");
})

app.get("/random" , async (req , res) =>{
    const queryParams = {
        apiKey:myApiKey,
        number:1,
        instructionsRequired: true,
        addRecipeInformation: true,
    }
    try{
        console.log(`${baseUrl}random?number=1`);
        const result = await axios.get(`${baseUrl}/random` , {params:queryParams});        
        let recipeInfo = getInfo(result.data.recipes);
        res.render("information.ejs" , {title: recipeInfo[0] , image: recipeInfo[1] , instructions: recipeInfo[2] , ingredients:recipeInfo[3], year: new Date().getFullYear()})
    }

    catch(error){
        res.send(error.message)
    }
    
})

app.post("/recipes" , async (req , res) =>{
    const queryParams = {
        apiKey:myApiKey,
        query: req.body.recipe,
        cuisine:req.body.cuisines,
        diet:req.body.diets,
        intolerances:req.body.intolerances,
        instructionsRequired: true,
        addRecipeInformation: true,
    }
    try{
        let recipeInfo = [];
        const result = await axios.get(`${baseUrl}complexSearch`, {params: queryParams});
        console.log(result.data);
        recipeInfo = getInfo(result.data.results);
        res.render("index.ejs" , {title: recipeInfo[0] , imageUrl: recipeInfo[1] , instructions: recipeInfo[2] , ingredients:recipeInfo[3], year: new Date().getFullYear()});
    }

    catch(error){
        console.log(error);
        console.log("error: " + error.message);
    }
})

app.post("/information" , (req, res)=>{
   let instructions = req.body.instructions.split(",");
   let ingredients = req.body.ingredients.split(",");
   res.render("information.ejs" , {title: req.body.title ,instructions: instructions, ingredients:ingredients , image: req.body.imageUrl , year: new Date().getFullYear()})

})


app.listen(port , ()=>{
    console.log(`server listening on port ${port}`);
})