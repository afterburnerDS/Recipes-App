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

let ingredients = ["banana", "tomato"];

function handleBack() {
    // comes back to current list of recipes of user
    $('.recipe__buttons--back').on('click', function (event) {
        console.log("back");
        showListRecipes();
    });
}

function handleSaveRecipe() {

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
    <p>${elem.name}</p>
    <div class="recipe__ingredientsInfo--qtt">
        <label for="servingUnity">Quantity</label>
        <input id="servingUnity" type="text" value="${elem.quantity}">
    </div>
    <div class="recipe__ingredientsInfo--unit">
        <label for="servingQuantity">Unit</label>
        <input id="servingQuantity" value ="${elem.unit}"type="text">
    </div>
</div>`

}

function showViewRecipe(target) {
    //find the object
    let recipeToRender = mockRecipes.find(recipe => {
        return recipe.title === target
    })
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
    handleBack();
    handleSignout();
    handleDeleteRecipe(recipeToRender);
    handleEditRecipe(recipeToRender);
}


function handleClickRecipe() {

    //serve page of recipe
    $(".recipeContainer").on("click", function (event) {
        //get the id of the recipe
        let target = $(event.target).closest("a.recipeContainer").children().children("div.recipeContainer__resume--title").children().text();

        //populate recipe fields
        showViewRecipe(target);
    })
}

function renderRecipeListRecipes(elem, index) {

    let ingredients = elem.ingredients.map(ingredient => {

        return ingredient.name;

    })

    return `<a class="recipeContainer">

    <div class="recipeContainer__resume">
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

function generateListRecipes() {
    console.log("aqui");
    let items = mockRecipes.map(function (elem, index) {
        return renderRecipeListRecipes(elem, index);

    });
    return items.join("");
}

function showListRecipes() {
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
    let recipesString = generateListRecipes();
    let recipeNew = ` <a class="listRecipes__new">
           
    <p class="listRecipes__new--text">Add New Recipe</p>
    </a>`;
    let recipesFinal = recipesString.concat(recipeNew);
    $('.listRecipes__content').html(recipesFinal);

    console.log("aqui");
    handleClickRecipe();
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

    $('.js-example-basic-multiple').on('select2:select', function (e) {
        //get the param text chosen
        let data = e.params.data.text;
        console.log(data);
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
            let qtt = $('#servingUnityPopup').val();
            let unit = $('#servingQuantityPopup').val();

            let ingredientToBeRendered = `<div class="recipe__ingredientsInfo--ingredient">
          <button class="recipeDelete">X</button>
          <p>${data}</p>
          <div class="recipe__ingredientsInfo--qtt">
              <label for="servingUnity">Quantity</label>
              <input id="servingUnity" type="text" value="${qtt}">
          </div>
          <div class="recipe__ingredientsInfo--unit">
              <label for="servingQuantity">Unit</label>
              <input id="servingQuantity" value ="${unit}" type="text">
          </div>
      </div>`;

            console.log(ingredientToBeRendered);

            $('.recipe__ingredientsInfo').append(ingredientToBeRendered);
            handleDeleteIngredient();
        })
    })
}

function handleNewRecipe() {
    $('.listRecipes__new').on('click', function (event) {

        $('.listRecipes').addClass("nodisplay");

        $('.newRecipe').removeClass("nodisplay");
        handleBack();
        handleSignout();
        handleSaveRecipe();
        handleNewIngredients();

    });
}

function handleLogin() {
    // open pop up with emal and password for login


    $("#login-form").on("submit", function (event) {

        //validate user information
        // const email = $('#email').val();
        // const pwd = $('#pwd').val();

        // //creates token for the user
        // $.ajax(

        //     {
        //         type: "post",
        //         url: "/login",
        //         email: email,
        //         pwd: pwd,

        //         data: {
        //             email: email,
        //             password: pwd
        //         },

        //         //saves it in localstorage
        //         success: function (data) {
        //             localStorage.token = data.token;
        //             alert('Got a token from the server! Token: ' + data.token);
        //         },
        //         error: function (data) {
        //             alert("Login Failed");
        //         }
        //     }

        // ).then(data => {

        //     $.ajax({
        //         type: 'GET',
        //         url: '/user/:id/recipes',
        //         beforeSend: function (xhr) {
        //             if (localStorage.token) {
        //                 xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
        //             }
        //         },
        //         success: function (data) {
        //             alert('Hello ' + data.name + '! You have successfully accessed to /api/profile.');
        //         },
        //         error: function () {
        //             alert("Sorry, you are not logged in.");
        //         }
        //     });

        // }).then(data => {

        
        // })

        event.preventDefault();
        $('.login-register-form').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        // show his list of recipes
        showListRecipes();
        $('.signout').removeClass("nodisplay");



        

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