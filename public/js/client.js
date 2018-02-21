
let idRecipe = "";
let data = [];
let currentPage = $('.newRecipe');
let ingredients = ["banana", "tomato"];

function handleBack() {
    // comes back to current list of recipes of user
    $('.recipe__buttons--back').off('click');
    $('.recipe__buttons--back').on('click', function (event) {

        getListRecpipes();
    });
}

function handleBackEdit() {
    // comes back to current list of recipes of user
    $('.recipe__buttons--backEdit').off('click');
    $('.recipe__buttons--backEdit').on('click', function (event) {
        
        getRecpipes();
          
    });
}

function handleSaveRecipe() {
    $(".recipe__buttons--save").off("click");
    $(".recipe__buttons--save").on("click", function (event) {

        //get title, description, url, 
        const title = $('.recipe__title--input', currentPage).val();
        const description = $('.recipe__description--input', currentPage).val();
        const url = $('.recipe__thumb--input', currentPage).val();
        let instructions = "";
        

        //get all tags

        let  tags = ""; 

        //get all ingredients

        const ingredients = [];
        

        $('.recipe__ingredientsInfo--ingredient', currentPage).each(function (i, ingredient) {
            let ingredientObj = {
                thumb: $(ingredient).children().children().children('.thumbIngredient').attr('src'),
                name: $(ingredient).children().children().children('.nameIngredient').text(),
                quantity: $(ingredient).children().children().children('.servingQuantity').val(),
                unit: $(ingredient).children().children().children('.servingUnity').val()
            };

            let itHasIngredient = ingredients.find(ingredient => {
                return ingredient.name === ingredientObj.name;
            })

            if (!itHasIngredient) {
                ingredients.push(ingredientObj);
            }
        });


        // If id is defined, lets do edit instead
        if (idRecipe) {
            instructions = $('#recipe_instructionsEdit').summernote('code');
            tags = $('#js-example-basic-multiple-tagsEdit').val();
    
            $.ajax({
                 
                type: 'PUT',


                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },

                url: `/recipes/${idRecipe}`,
                data: JSON.stringify({
                    id: idRecipe,
                    title: title,
                    description: description,
                    url: url,
                    instructions: instructions,
                    ingredients: ingredients,
                    tags: tags,
                }),
                success: function (data) {
                    //show a popup saying saved
                },
                error: function (data) {

                }

            });

        } else {
             instructions = $('#instructions').summernote('code');
             tags= $('#js-example-basic-multiple-tags').val();
            $.ajax({
                type: 'POST',


                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },

                url: `/recipes`,
                data: JSON.stringify({
                    title: title,
                    description: description,
                    url: url,
                    instructions: instructions,
                    ingredients: ingredients,
                    tags: tags,
                }),
                success: function (data) {
                    //show a popup saying saved
                    idRecipe = data.id;

                },
                error: function (data) {
                }

            });
        }

        event.preventDefault();
        if(!title ){
            $('#myModalNoTitle').modal();

        }else {
            $('#myModalSave').modal();
        }
      
    })
    
}

function handleEditRecipe(recipeToRender) {
    //loads edit recipe
    $(".recipe__buttons--edit").off('click')
    $(".recipe__buttons--edit").on('click', function (event) {
        currentPage = $('.editRecipe');
        //  idRecipe = recipeToRender.id;
        //unload other pages
        $('.content_mainPage').addClass("nodisplay");
        $('.newRecipe').addClass("nodisplay");
        $('.viewRecipe').addClass("nodisplay");
        $('.listRecipes').addClass("nodisplay");
        // load the page

        $('.editRecipe').removeClass("nodisplay");
        //set title, description and instructions

        $('#recipe__title--inputEdit').val(recipeToRender.title);
        $('#recipe__description--inputEdit').val(recipeToRender.description);
        $('#recipe__thumb--inputEdit').val(recipeToRender.url);
        $('#recipe_instructionsEdit').summernote('code',recipeToRender.instructions);

        let recipeIngredients = recipeToRender.ingredients;
        let recipeIngredientsArray = recipeIngredients.map(function (elem, index) {

            return renderRecipeListIngredientsEdit(elem);

        });

        $('.recipe__ingredientsInfo', currentPage).html(recipeIngredientsArray.join(""));

        recipeIngredients.forEach(function (ing) {

            let  name = ing.name.replace(/\s/g, '');

            $(`#servingUnity${name}Edit option`, currentPage).prop('selected', false).filter(function() {
                
                return $(this).val() == ing.unit;  
            }).prop('selected', true);

        });

        $("#js-example-basic-multiple-tagsEdit").empty().select2();
        $('#js-example-basic-multiple-tagsEdit').select2({
            ajax: {
                url: "/allTags",
                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },
               
            },
            tags: true,
            minimumInputLength: 3
    
        });
        let i = 1;
        

        recipeToRender.tags.forEach(function(tag) {
            $("#js-example-basic-multiple-tagsEdit").select2("trigger", "select", {
                data: 
                        { id:tag,
                        text: tag }
                    
            });
            i++;
    
        })

        handleBackEdit();
        handleNewIngredients();
        handleDeleteRecipe();
        handleSaveRecipe();
        handleDeleteIngredient();
        handleSignout();
        handleNewImage();

    })

}

function handleDeleteRecipe() {

    $('.recipe__buttons--delete').off('click');
    $('.recipe__buttons--delete').on('click', function (event) {
        $('#myModalDelete').modal();
        $('.recipe_delete').off('click');
        $('.recipe_delete').on('click', function(event){
           
        if (idRecipe) {

            $.ajax({
                type: 'DELETE',


                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },

                url: `/recipes/${idRecipe}`,
              
                success: function (data) {
                    //go back to list of recipes
                    getListRecpipes();

                },
                error: function (data) {
                 
                }

            });

        }

        $('#myModalDelete').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });
        
    })
}


function renderRecipeTags(elem) {
    return `<p class="recipe__tags-name">${elem}</p>
    `;
}

function renderUrlsEdit(elem) {
    return `<div class="recipe__media--box">
    <p class="recipe__media--close">X</p>
    <input class="recipe__media--url" type="text" placeholder="past here your url of the hosted image (i.e pixabay)" value=${elem}>
</div>`;
}

function renderRecipeUrls(elem) {

    return `<p class="recipe__urls-name">${elem}</p>
    `;

}

function renderRecipeListIngredients(elem) {

    return `<div class="recipe__ingredientsInfo--ingredient">
                <div class="content">
                    <div class="nameAndThumb">
                        <p class="nameIngredient">${elem.name}</p>
                        <img class="thumbIngredient" src="${elem.thumb}" alt="image of ingredient"></img>
                    </div>
                    <div class="recipe__qtt">
                        <label for="servingQuantityView">Quantity</label>
                        <p class="servingQuantityView">${elem.quantity}</p>
                    </div>
                    <div class="recipe__unit">
                        <label for="servingUnityView">Unit</label>
                        <p class="servingUnityView">${elem.unit}</p>
                    </div>
                </div>
             </div>`;
}

function renderRecipeListIngredientsEdit(elem, idRecipe) {
    

    let  name = elem.name.replace(/\s/g, '');

    return `  <div class="recipe__ingredientsInfo--ingredient">
            <a href="#" class="buttonEdit recipeDelete">X</a>
            <div class="content">
            <div class="nameAndThumb">
                <p class="nameIngredient">${elem.name}</p>
                <img class="thumbIngredient" src="${elem.thumb}" alt="description of ingredient"></img>
            </div>
            <div class="recipe__qtt">
                <label for="servingQuantity${elem.name}Edit">Quantity</label>
                <input class="servingQuantity" id="servingQuantity${elem.name}Edit" type="text" value="${elem.quantity}">
            </div>
            <div class="recipe__unit">
                <label for="servingUnity${name}Edit">Unit</label>
                <select class="servingUnity" id="servingUnity${name}Edit">
                                          <option value="litre(s)">litre(s)</option>
                                          <option value="gram(s)">gram(s)</option>
                                          <option value="piece(s)">piece(s)</option>
                                          <option value="cup(s)">cup(s)</option>
                                          <option value="teespoon(s)">teespoon(s)</option>
                                      </select>
            </div>
            </div>
        </div>`;
}

function showViewRecipe(data, id) {
    //find the object
    currentPage = $('.viewRecipe');
  
    let recipeToRender = data.find(recipe => {
        return recipe._id === id;
    })

    //unload other pages
    $('.content_mainPage').addClass("nodisplay");
    $('.newRecipe').addClass("nodisplay");
    $('.editRecipe').addClass("nodisplay");
    $('.listRecipes').addClass("nodisplay");
    // load the page

    $('.viewRecipe').removeClass("nodisplay");

    $('.recipe__titleView--value').text(recipeToRender.title);
    $('.recipe__descriptionView--desc').text(recipeToRender.description);
    
    if(!recipeToRender.description){
        $('.recipe__descriptionView--desc').addClass("nodisplay");
    }else {
        $('.recipe__descriptionView--desc').removeClass("nodisplay");
    }
 
    if(recipeToRender.instructions ==="<p><br></p>" || recipeToRender.instructions === ""){
        
        $('.recipe__instructionsView--title').addClass("nodisplay");
    }else{
        $('.recipe__instructionsView--title').removeClass("nodisplay");
    }
    $('.recipe__instructionsView--content').html(recipeToRender.instructions);

    

    if (recipeToRender.tags) {
        let recipeTagsArray = recipeToRender.tags.map(function (elem, index) {
            return renderRecipeTags(elem, index);
        })



        $('.recipe__tagsView', currentPage).html(recipeTagsArray.join(""));

    }

    if (recipeToRender.ingredients) {
        let recipeIngredients = recipeToRender.ingredients;
        let recipeIngredientsArray = recipeIngredients.map(function (elem, index) {
            return renderRecipeListIngredients(elem, index);

        });

        if(!recipeIngredients.length){

            $('.recipe__ingredientsView--title').addClass("nodisplay");

        }else{
            $('.recipe__ingredientsView--title').removeClass("nodisplay");
        }

        
        $('.recipe__ingredientsView--info').html(recipeIngredientsArray.join(""));
    }

   
    handleSignout();

    handleDeleteRecipe();
    handleEditRecipe(recipeToRender);
    handleBack(data);
}


function handleClickRecipe(data) {

    //serve page of recipe
    $(".recipeContainer").on("click", function (event) {
        //get the id of the recipe
    
        if ($(event.target).attr("class") === "recipeContainer__resume") {
            idRecipe = $(event.target).attr("data-recipeId");
        } else {
            idRecipe = $(event.target).parents(".recipeContainer__resume").attr("data-recipeId");
        }

        //populate recipe fields
        currentPage = $('.viewRecipe');
        showViewRecipe(data, idRecipe);
    })
}

function renderRecipeListRecipes(elem, index) {
    let newDesc = "";
    let newTitle = "";
       let ingredients = elem.ingredients.map(ingredient => {

        return ingredient.name;

    })

    if (elem.title.length > 20) {
        newTitle = elem.title.substr(0, 30) + '...';
    } else {
        newTitle = elem.title;
    }
   
    if(elem.url === ""){
        elem.url = "http://www.wfuv.org/sites/default/files/ingredients.jpg";
    }

    if (elem.description.length > 60) {
        newDesc = elem.description.substr(0, 60) + '...';
    } else {
        newDesc = elem.description;
    }

    if(elem.url === ""){
        elem.url = "http://www.wfuv.org/sites/default/files/ingredients.jpg";
    }

    let newIngs = "";
    if (ingredients.length > 7) {
        newIngs = ingredients.slice(0,7).join(", ") + " + other " + (ingredients.length - 7);
    } else {
        newIngs = ingredients.join(", ");
    }

    let newTags = "";
    if (elem.tags.length > 3) {
        newTags = elem.tags.slice(0,3).join(", ") + " + other " + (elem.tags.length - 3);
    } else {
        newTags = elem.tags.join(", ");
    }

    return `<a href="#" class="recipeContainer">

    <div class="recipeContainer__resume" data-recipeId="${elem._id}">
        <div class="recipeContainer__resume--title">
            <p class="title">${newTitle}</p>
            <p class="tags">${newTags}</p>
        </div>
        <div class="recipeContainer__resume--main">
            <div class="recipeContainer__resume--thumb">
                <img src="${elem.url}" alt="descriptive pic"></img>
            </div>
            <div class="recipeContainer__resume--info">

                <div class="recipeContainer__resume--desc">
                    ${newDesc}
                </div>

                    <div class="recipeContainer__resume--ingredients">

                            <p class="title"><strong>Ingredients</strong></p>
                           <p>${newIngs}</p>
                        </div>
            </div>
            
        </div>

    </div>
</a>`;
}

function generateListRecipes(data) {
    let items = data.map(function (elem, index) {
        return renderRecipeListRecipes(elem, index);

    });
    return items.join("");
}

function showListRecipes(data) {

    //Show list of recipes

    $('.content_mainPage').addClass("nodisplay");
    $('.newRecipe').addClass("nodisplay");
    $('.viewRecipe').addClass("nodisplay");
    $('.editRecipe').addClass("nodisplay");
    $('.listRecipes').removeClass("nodisplay");
    let recipesString = generateListRecipes(data);
    let recipeNew = ` <a href="#" class="listRecipes__new">
           
    <p class="listRecipes__new--text">Add New Recipe</p>
    </a>`;
    let recipesFinal = recipeNew.concat(recipesString);
    $('.listRecipes__content').html(recipesFinal);

    handleClickRecipe(data);
    handleSignout();
    handleNewRecipe();

    $('#js-example-basic-multiple-filterbyTag').off('select2:select	');
    $('#js-example-basic-multiple-filterbyTag').on('select2:select	', function (e) {

     
        getFilteredRecipes();
    });

    $('#js-example-basic-multiple-filterbyTag').off('select2:unselect	');
    $('#js-example-basic-multiple-filterbyTag').on('select2:unselect	', function (e) {

      
        getFilteredRecipes();
    });

    $('#js-example-basic-multiple-filterbyIng').off('select2:select	');
    $('#js-example-basic-multiple-filterbyIng').on('select2:select	', function (e) {
        getFilteredRecipes();
    });


    $('#js-example-basic-multiple-filterbyIng').off('select2:unselect	');
    $('#js-example-basic-multiple-filterbyIng').on('select2:unselect	', function (e) {
        getFilteredRecipes();
    });

}

function getFilteredRecipes() {

    let tagsSelected = $('#js-example-basic-multiple-filterbyTag').val();
    let ingsSelected = $('#js-example-basic-multiple-filterbyIng').val();

    $.ajax({
        type: 'GET',
        url: `/filteredRecipes/`,
        beforeSend: function (xhr) {
            if (localStorage.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
            }

        },

        data: {
            ingsSelected: ingsSelected,
            tagsSelected: tagsSelected

        },

        success: function (recipes) {
            data = recipes;
            // bring the recipes from the user
            $('.login-register-form').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            // show his list of recipes
            showListRecipes(data);
            $('.signout').removeClass("nodisplay");

        },
        error: function () {
            alert("Sorry, you are not logged in.");
        }
    })
}

function handleDeleteIngredient() {

    $('.recipeDelete').on('click', event => {
        //get the parent container and remove it from the dom

        $(event.target).parents('.recipe__ingredientsInfo--ingredient').remove();
    })
}

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

function handleNewIngredients() {
    $('.js-example-basic-multiple').off('select2:select');
    $('.js-example-basic-multiple').on('select2:select', function (e) {
        //get the param text chosen
        let data = e.params.data.text;
        let name = data.replace(/\s/g, '');
        let thumb = e.params.data.thumb;
        //clear the selection
        $('.js-example-basic-multiple').val('').trigger('change')
        //populate the modal with the name of the ingredient
        $('.recipe__ingredientsInfoPopup--name').text(data);
        $('.recipe__ingredientsPopup--url').attr('src',`${thumb}`);
        //open the modal
        $('#myModal').modal();
        //load the new ingredient into the recipe after save
        $('.saveIngredient').off('click');
        $('.saveIngredient').on('click', event => {
            //get the qtt, unit
             
            let qtt = $('#servingQuantityPopup').val();
            let unit = $('#servingUnityPopup').val();

            if(isNumber(qtt)){
                let ingredientToBeRendered = function renderIngredient() {
                
            
                    return  `  <div class="recipe__ingredientsInfo--ingredient">
                     <a href="#" class="buttonEdit recipeDelete">X</a>
                     <div class="content">
                     <div class="nameAndThumb">
                         <p class="nameIngredient">${data}</p>
                         <img class="thumbIngredient" src="${thumb}" alt="description of ingredient"></img>
                     </div>
                     <div class="recipe__qtt">
                         <label for="servingQuantity${name}New">Quantity</label>
                         <input class="servingQuantity" id="servingQuantity${name}New" type="text" value="${qtt}">
                     </div>
                     <div class="recipe__unit">
                         <label for="servingUnity${name}New">Unit</label>
                         <select class="servingUnity" id="servingUnity${name}New">
                                                   <option value="litre(s)">litre(s)</option>
                                                   <option value="gram(s)">gram(s)</option>
                                                   <option value="piece(s)">piece(s)</option>
                                                   <option value="cup(s)">cup(s)</option>
                                                   <option value="teespoon(s)">teespoon(s)</option>
                                               </select>
                     </div>
                     </div>
                 </div>`;
                }
                     

            $('.recipe__ingredientsInfo', currentPage).append(ingredientToBeRendered);

            $(`#servingUnity${name}New option`, currentPage).prop('selected', false).filter(function() {
                return $(this).text() == unit;  
            }).prop('selected', true);


            $('#myModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('.warningNotNumber').addClass('nodisplay');

           
            }else{
                $('.warningNotNumber').removeClass('nodisplay');
            }

          
            handleDeleteIngredient();
        })

    })
}

function handleNewRecipe() {
    $('.listRecipes__new').on('click', function (event) {

        $('.listRecipes').addClass("nodisplay");

        $('.newRecipe').removeClass("nodisplay");

        //reset all values
        $('.recipe__title--input').val('');
        $('.recipe__description--input').val('');
        $('.recipe__thumb--input').val('');
        $('.recipe__ingredientsInfo').html('');
        $("#js-example-basic-multiple-tags").empty().select2();
        $('#js-example-basic-multiple-tags').select2({
            ajax: {
                url: "/allTags",
                beforeSend: function (xhr) {
                    if (localStorage.token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                    }
                },
                minimumInputLength: 3
            },
            tags: true,
    
        });
        idRecipe = "";
        currentPage = $('.newRecipe');

    });

    handleBack();
    handleSignout();
    handleSaveRecipe();
    handleNewIngredients();
    handleNewImage()
}

function getListRecpipes() {
    $.ajax({
        type: 'GET',
        url: `/recipes/`,
        beforeSend: function (xhr) {
            if (localStorage.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
            }
        },
        success: function (recipes) {
            data = recipes;
            // bring the recipes from the user
            $('.login-register-form').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            // show his list of recipes
            showListRecipes(data);
            $('.signout').removeClass("nodisplay");

        },
        error: function () {
            alert("Sorry, you are not logged in.");
        }
    });
}

function getRecpipes() {
    $.ajax({
        type: 'GET',
        url: `/recipes/`,
        beforeSend: function (xhr) {
            if (localStorage.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
            }
        },
        success: function (recipes) {
            data = recipes;
            showViewRecipe(data,idRecipe);
            
        },
        error: function () {
            alert("Sorry, you are not logged in.");
        }
    });
}


function handleLogin() {
    // open pop up with emal and password for login


    $("#login-form").on("submit", function (event) {

        //validate user information
        const email = $('#email').val();
        const pwd = $('#pwd').val();
        //creates token for the user
        $.ajax(

            {
                type: "post",
                beforeSend: function (request) {
                    request.setRequestHeader("Content-Type", "application/json");
                },
                url: "/api/auth/login",
                // email: email,
                // pwd: pwd,

                data: JSON.stringify({
                    email: email,
                    password: pwd
                }),

                //saves it in localstorage
                success: function (data) {
                    localStorage.token = data.authToken;
                    $('.nonExistingUser').addClass("nodisplay");
                },
                error: function (data) {
                     
                    $('.nonExistingUser').removeClass("nodisplay");
                }
            }

        ).then(data => {

            // bring the recipes from the user
            getListRecpipes();

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
    $("#registration-form").on("submit", function (event) {
        event.preventDefault();
        //validate user information
        const newName = $('#name').val();
        const newEmail = $('#newemail').val();
        const newPwd = $('#newpwd').val();
        //creates token for the user
        $.ajax(

            {
                type: "post",
                beforeSend: function (request) {
                    request.setRequestHeader("Content-Type", "application/json");
                },
                url: "/api/users/",


                data: JSON.stringify({
                    email: newEmail,
                    password: newPwd,
                    name: newName

                }),

                //saves it in localstorage
                success: function (data) {
                    // localStorage.token = data.authToken;
                    // alert('Got a token from the server! Token: ' + data.authToken);
                    $('.alreadyRegisteredUser').text("");
                },
                error: function (data) {
                  
                    const err = JSON.parse(data.responseText);
                    console.log(err.message);
                    $('.alreadyRegisteredUser').text(err.message);
                } 
            }

        ).then(data => {

            //creates token for the user
            $.ajax(

                {
                    type: "post",
                    beforeSend: function (request) {
                        request.setRequestHeader("Content-Type", "application/json");
                    },
                    url: "/api/auth/login",
                    // email: email,
                    // pwd: pwd,

                    data: JSON.stringify({
                        email: newEmail,
                        password: newPwd
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

                // bring the recipes from the user
                getListRecpipes();

            })
        })
    })

    // create new entry in user database

}

function handleDeleteMedia() {
    $('.recipe__media--close').off('click');
    $('.recipe__media--close').on('click', function (event) {
        $(event.target).parents('.recipe__media--box').remove();
    });
}

function handleNewImage() {

    $('.recipe__media--button').off('click');
    $('.recipe__media--button').on('click', function (event) {

        let boxImage = ` <div class="recipe__media--box">
            <p class="recipe__media--close">X</p>
            <input class="recipe__media--url" type="text" placeholder="past here your url of the hosted image (i.e pixabay)">
        </div>`;


        $('.recipe__media', currentPage).append(boxImage);


        handleDeleteMedia();
    });
}

function init() {
    $('.js-example-basic-multiple').select2({

        ajax: {
            url: "/api/select",
        },
        minimumInputLength: 3,
        escapeMarkup: function (markup) {
            return markup;
        },
        templateResult: formatIngredient,
        templateSelection: formatIngSelection
    });

    function formatIngredient(ingredient) {

        if (ingredient.loading) {
            return ingredient.text;
        }

        let markup =
            `<div class="select2-result-ingredient clearfix">
            <div class="select2-result-ingredient__thumb">
                <img src="${ingredient.thumb}"/>
            </div>
            <div class="select2-result-ingredient__meta">
                <div class="select2-result-ingredient__title">
                    ${ingredient.text}
                </div>
            </div>
        </div>`;
       return markup;
    }

    function formatIngSelection(ingredient) {
        return ingredient.text;
    }

    $('#js-example-basic-multiple-filterbyIng').select2({
        ajax: {
            url: "/allIngs",
            beforeSend: function (xhr) {
                if (localStorage.token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                }
            },
           
        },
        minimumInputLength: 3,

    });

    $('#js-example-basic-multiple-filterbyTag').select2({
        ajax: {
            url: "/allTags",
            beforeSend: function (xhr) {
                if (localStorage.token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
                }
            }
           
        },
        minimumInputLength: 3,

    });

    $('#instructions').summernote();
    $('#recipe_instructionsEdit').summernote();
    delete $.summernote.options.keyMap.pc.TAB;
    delete $.summernote.options.keyMap.mac.TAB;

    
    //serve the login page
    handleLogin();
    handleSignup();

}


$(init())