const mockRecipes = [{
        "title": "Soup with chicken",
        "desctiption": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, ullam.",
        "ingredients": [{
                "name": "soup",
                "quantity": 1,
                "unit": "litre"
            },
            {
                "name": "chicken",
                "quantity": 3,
                "unit": "decalitre"
            }
        ],
        "instructions": "put chicken in the water and let it boil real good",
        "media": "random url"
    },

    {
        "title": "Duck with bread",
        "desctiption": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, ullam.",
        "ingredients": [{
                "name": "duck",
                "quantity": 1,
                "unit": "litre"
            },

            {
                "name": "bread",
                "quantity": 3,
                "unit": "decalitre"
            }
        ],
        "instructions": "put duck in the bread and let it stuff real good",
        "media": "random url"
    },
]

const currentPage = $('.newRecipe');
let ingredients = ["banana", "tomato"];

function handleBack(data) {
    // comes back to current list of recipes of user
    $('.recipe__buttons--back').on('click', function (event) {
        console.log("back");
        showListRecipes(data);
    });
}

function handleSaveRecipe() {
   
    $(".recipe__buttons--save").on("click", function (event) {

        //validate user information
        const title = $('#ingredientsChooseer').val();
        const instructions = $('#instructions').val();

        //get all ingredients

        const ingredients = [];
        // console.log($('recipe__ingredientsInfo'));

        $('.recipe__ingredientsInfo--ingredient').each(function(i, ingredient) {
            let ingredientObj = {
                name : $(ingredient).children('.nameIngredient').text(),
                quantity:$(ingredient).children().children('#servingQuantity').val(),
                unitIngredient: $(ingredient).children().children('#servingUnity').val()
            };

            console.log($(ingredient));
            
            let itHasIngredient = ingredients.find(ingredient => {
                return ingredient.name === ingredientObj.name;
            })

            if(!itHasIngredient){
                ingredients.push(ingredientObj);
            }

            
            
        });
        
        console.log(title + instructions);
        console.log(ingredients);
        
        
        //creates token for the user
            $.ajax({
                type: 'POST',
                url: `http://localhost:3000/recipes`,
              
                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },
                data: JSON.stringify({
                    title: title,
                    instructions: instructions,
                    ingredients: ingredients
                }),
                success: function (data) {
                    //show a popup saying saved
                    
                   
                },
                error: function (data) {
                    
                }
                
            });

       
        event.preventDefault();
    })

}

function handleEditRecipe(recipeToRender) {
    //loads edit recipe
    $(".recipe__buttons--edit").on('click', function (event) {

        //unload other pages
        $('.content_mainPage').addClass("nodisplay");
        $('.newRecipe').addClass("nodisplay");
        $('.viewRecipe').addClass("nodisplay");
        $('.listRecipes').addClass("nodisplay");
        // load the page

        $('.editRecipe').removeClass("nodisplay");

        $('#titleChooser').val(recipeToRender.title);
        $('#recipe_instructionsEdit').val(recipeToRender.instructions);

        let recipeIngredients = recipeToRender.ingredients;
        let recipeIngredientsArray = recipeIngredients.map(function (elem, index) {

            return renderRecipeListIngredientsEdit(elem, index);

        });

        $('.recipe__ingredientsInfo').html(recipeIngredientsArray.join(""));

        handleBack();
        handleNewIngredients();
        handleDeleteRecipe();
        handleSaveRecipe();
        handleDeleteIngredient();
        handleSignout();

    })

}

function handleDeleteRecipe() {

}

function renderRecipeListIngredients(elem) {

    return `<p class="recipe__ingredients--info__name">${elem.name}</p>
    <div class="recipe__ingredients--info__unity">
        <p class="label">Unit</p>
        <p class="value">${elem.unit}</p>
    </div>
    <div class="recipe__ingredients--info__quantity">
        <p class="label">Quantity</p>
        <p class="value">${elem.quantity}</p>
    </div>
    `;
}

function renderRecipeListIngredientsEdit(elem) {
    return ` <div class="recipe__ingredientsInfo--ingredient">
    <button class="recipeDelete">X</button>
    <p class="nameIngredient">${elem.name}</p>
    <div class="recipe__ingredientsInfo--qtt">
        <label for="servingQuantity">Quantity</label>
        <input id="servingQuantity" type="text" value="${elem.quantity}">
    </div>
    <div class="recipe__ingredientsInfo--unit">
        <label for="servingUnity">Unit</label>
        <input id="servingUnity" value ="${elem.unit}"type="text">
    </div>
</div>`

}

function showViewRecipe(data, id) {
    //find the object

    
    let recipeToRender = data.find(recipe => {
        return recipe._id === id;
    })

    console.log(recipeToRender);

    
    //unload other pages
    $('.content_mainPage').addClass("nodisplay");
    $('.newRecipe').addClass("nodisplay");
    $('.editRecipe').addClass("nodisplay");
    $('.listRecipes').addClass("nodisplay");
    // load the page

    $('.viewRecipe').removeClass("nodisplay");

    $('.recipe__title--value').text(recipeToRender.title);
    $('.recipe__instructions').text(recipeToRender.instructions);


    let recipeIngredients = recipeToRender.ingredients;
    let recipeIngredientsArray = recipeIngredients.map(function (elem, index) {
        return renderRecipeListIngredients(elem, index);

    });

    $('.recipe__ingredients--info').html(recipeIngredientsArray.join(""));
    handleBack(data);
    handleSignout();
    handleDeleteRecipe(recipeToRender);
    handleEditRecipe(recipeToRender);
}


function handleClickRecipe(data) {

    //serve page of recipe
    $(".recipeContainer").on("click", function (event) {
        //get the id of the recipe

        let id = "";
        

        // console.log();

        if($(event.target).attr("class") ==="recipeContainer__resume" ){
            id= $(event.target).attr("data-recipeId");
        }else{
            id = $(event.target).parents(".recipeContainer__resume").attr("data-recipeId");
        }

        console.log(data);

        //populate recipe fields
        showViewRecipe(data,id);
    })
}

function renderRecipeListRecipes(elem, index) {
    console.log(elem);
    let ingredients = elem.ingredients.map(ingredient => {

        return ingredient.name;

    })

    return `<a class="recipeContainer">

    <div class="recipeContainer__resume" data-recipeId="${elem._id}">
        <div class="recipeContainer__resume--title">
            <h3 class="title">${elem.title}</h3>
        </div>
        <div class="recipeContainer__resume--main">
            <div class="recipeContainer__resume--thumb"></div>
            <div class="recipeContainer__resume--info">

                <div class="recipeContainer__resume--desc">
                    ${elem.desctiption}
                </div>

                    <div class="recipeContainer__resume--ingredients">

                            <p><strong>Ingredients</strong></p>
                           <p>${ingredients.join(", ")}</p>
                        </div>
            </div>
            
        </div>

    </div>
</a>`;
}

function generateListRecipes(data) {
    console.log("aqui");
    let items = data.map(function (elem, index) {
        return renderRecipeListRecipes(elem, index);

    });
    return items.join("");
}

function showListRecipes(data) {
    console.log("auqi");
    //Show list of reipes
    // insert that HTML into the DOM
    // let listRecipesString =    `<div class="listRecipes">
    // <div class="listRecipes__title">
    //     <h2>List of Recipes</h2>
    // </div>
    //     <div class="listRecipes__content">


    //     </div>

    // </div>`;
    // $('.container').html(listRecipesString);
    $('.content_mainPage').addClass("nodisplay");
    $('.newRecipe').addClass("nodisplay");
    $('.viewRecipe').addClass("nodisplay");
    $('.editRecipe').addClass("nodisplay");
    $('.listRecipes').removeClass("nodisplay");
    let recipesString = generateListRecipes(data);
    let recipeNew = ` <a class="listRecipes__new">
           
    <p class="listRecipes__new--text">Add New Recipe</p>
    </a>`;
    let recipesFinal = recipesString.concat(recipeNew);
    $('.listRecipes__content').html(recipesFinal);

    handleClickRecipe(data);
    handleSignout();
    handleNewRecipe();
}

function handleDeleteIngredient() {

    $('.recipeDelete').on('click', event => {
        //get the parent container and remove it from the dom
        $(event.target).parents('.recipe__ingredientsInfo--ingredient').remove();
    })
}

function handleNewIngredients() {
    $('.js-example-basic-multiple').off('select2:select');
    $('.js-example-basic-multiple').on('select2:select', function (e) {
        //get the param text chosen
        let data = e.params.data.text;
        //clear the selection
        $('.js-example-basic-multiple').val('').trigger('change')
        //populate the modal with the name of the ingredient
        $('.recipe__ingredientsInfoPopup--name').text(data);
        //open the modal
        $('#myModal').modal();
        //load the new ingredient into the recipe after save
        $('.saveIngredient').off('click');
        $('.saveIngredient').on('click', event => {
            //get the qtt, unit
            console.log("save click");
            let qtt = $('#servingUnityPopup').val();
            let unit = $('#servingQuantityPopup').val();

            let ingredientToBeRendered = `
            
     <div class="recipe__ingredientsInfo--ingredient">
          <button class="recipeDelete">X</button>
          <p class="nameIngredient">${data}</p>
          <div class="recipe__qtt">
              <label for="servingQuantity">Quantity</label>
              <input id="servingQuantity" type="text" value="${qtt}">
          </div>
          <div class="recipe__unit">
              <label for="servingUnity">Unit</label>
              <input id="servingUnity" value ="${unit}" type="text">
          </div>
      </div>`;

            

            // currentPage.find('.recipe__ingredientsInfoNew').append(ingredientToBeRendered);

            $('.recipe__ingredientsInfoNew', currentPage).append(ingredientToBeRendered);


            $('.recipe__ingredientsInfo--ingredient').each(function(i, ingredient) {
              console.log(ingredient);
            });

            // console.log($('.recipe__ingredientsInfo--ingredient'));

           handleDeleteIngredient();
        })
        
    })
}

function handleNewRecipe() {
    $('.listRecipes__new').on('click', function (event) {

        $('.listRecipes').addClass("nodisplay");

        $('.newRecipe').removeClass("nodisplay");
        

    });

    handleBack();
        handleSignout();
        handleSaveRecipe();
        handleNewIngredients();
}

function handleLogin() {
    // open pop up with emal and password for login


    $("#login-form").on("submit", function (event) {

        //validate user information
        const email = $('#email').val();
        const pwd = $('#pwd').val();
        console.log(email + pwd);
        //creates token for the user
        $.ajax(

            {
                type: "post",
                beforeSend: function (request) {
                    request.setRequestHeader("Content-Type", "application/json");
                },
                url: "http://localhost:3000/api/auth/login",
                // email: email,
                // pwd: pwd,

                data: JSON.stringify({
                    email: email,
                    password: pwd
                }),

                //saves it in localstorage
                success: function (data) {
                    localStorage.token = data.authToken;
                    // alert('Got a token from the server! Token: ' + data.authToken);
                },
                error: function (data) {
                    // alert("Login Failed");
                }
            }

        ).then(data => {

            console.log(data);
            // bring the recipes from the user
            $.ajax({
                type: 'GET',
                url: `http://localhost:3000/recipes/`,
                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },
                success: function (data) {

                    // bring the recipes from the user
                    $('.login-register-form').modal('hide');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    // show his list of recipes
                    showListRecipes(data);
                    $('.signout').removeClass("nodisplay");


                    // alert('Hello ' + data.name + '! You have successfully accessed to /api/profile.');
                },
                error: function () {
                    alert("Sorry, you are not logged in.");
                }
            });

        })

        event.preventDefault();
    })


}

function handleSignout() {

    $('.signout').on('click', function (event) {

        $('.content_mainPage').removeClass("nodisplay");
        $('.newRecipe').addClass("nodisplay");
        $('.viewRecipe').addClass("nodisplay");
        $('.editRecipe').addClass("nodisplay");
        $('.listRecipes').addClass("nodisplay");
        $('.signout').addClass("nodisplay");
    });

}

function handleSignup() {
    //open pop up with email and password for registration
    // validae user information
    // create new entry in user database

}




function init() {
    $('.js-example-basic-multiple').select2({

        ajax: {
            url: "http://localhost:3000/api/select",
        },
        minimumInputLength: 3

    });


    //serve the login page
    handleLogin();
    handleSignup();

    //showRecipes();

}


$(init())