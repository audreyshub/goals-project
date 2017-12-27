$(document).ready(() => {
    $('.create-goal').submit(event => {
        event.preventDefault();
        const goalTitle = $('input[name="goal"]').val();
        const goalStart = $('input[name="start-date"]').val();
        const goalEnd = $('input[name="end-date"]').val();

        console.log(goalTitle);
        console.log(goalStart);
        console.log(goalEnd);

        const newGoal = {
            name: goalTitle,
            startDate: goalStart,
            endDate: goalEnd

        }
        $('input[name="goal"]').val('');
        $('input[name="start-date"]').val('');
        $('input[name="end-date"]').val('');

        $.ajax({
            url: 'http://localhost:3232/goal/create',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(newGoal),
            success: function(data) {
                console.log(data);
                swal({
                    title: "Yay!",
                    text: "Goal was created!",
                    icon: "success"
                });
                $('.list-goals').append(`<div class="my-goals" value="${data.data.name}"><img class="seed" value="${data.data._id}" src="images/seedling.png"><p value="${data.data._id}">${data.data.name}</p></div>`);

            },
            error: function(error) {
                console.log(error);
            }
        });
        //TODO validate dates
        //TODO call the API
    })

    $.ajax({
        url: 'http://localhost:3232/goal/all',
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',

        success: function(data) {

            data.data.forEach((goal) => {
                console.log(goal);
                $('.list-goals').append(`
                	<div class="my-goals" value="${goal.name}">
                	<img class="seed" value="${goal._id}" src="images/seedling.png">
                	<p value="${goal._id}">${goal.name}</p>

                	</div>`);
            })

        },
        error: function(error) {
            console.log(error);
        }
    });
})

$('.list-goals').on('click', '.my-goals', (event) => {
    $('html, body').animate({
        scrollTop: ($('.garden').offset().top)
    }, 500);
    $('.garden').html(`<div><input type="button" class="delete" value="Delete goal"></div>`);
    $('.garden').append(`<h2>Enter actions:</h2>`);
    $('.garden').append(`<div><input type="text" class="new-action" name="action" placeholder="walked 20 minutes" required/></div>`);
    console.log(event.target.attributes.value.nodeValue);
    $('.garden').append(`<div><input type="hidden" class="hidden-id" name="id" value="${event.target.attributes.value.nodeValue}"></div>`);

    $('.garden').append(`<div><input type="submit" class="action-submit" name="submit" value="Submit"></div>`);

    $.ajax({
        url: 'http://localhost:3232/goal/getbyid/' + event.target.attributes.value.nodeValue,
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',

        success: function(result) {


            let goal = result.data;
            console.log(goal);

            if (goal.actions.length === 0) {
                $('.garden').append(`<h3>${goal.name}</h3>`)
                $('.garden').append(`<img class="action-seed" src="images/seed.png">`);
            } else {
                $('.garden').append(`Actions taken for <h3>${goal.name}:</h3>`);
                //$('.garden').append(`<div class="actions></div>`);
                goal.actions.forEach(action => {
                    $('.garden').append(`<p>${action}</p>`);
                })
                $('.garden').append(`<img class="action-plant" src="images/plant01.png">`);
            }



        },
        error: function(error) {
            console.log(error);
        }
    });

})

$('.garden').on('click', '.action-submit', (event) => {

    $.ajax({
        url: 'http://localhost:3232/goal/addaction/' + $('.hidden-id').val(),
        dataType: 'json',
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify({ action: $('.new-action').val() }),
        success: function(data) {
            console.log(data);


        },
        error: function(error) {
            swal("Oh no!", "An error happened!", "error");
        }
    });
})

$('.garden').on('click', '.delete', (event) => {
    console.log('delete button clicked')
    $.ajax({
        url: 'http://localhost:3232/goal/remove/' + $('.hidden-id').val(),
        dataType: 'json',
        type: 'delete',
        contentType: 'application/json',

        success: function(data) {
            console.log(data);
            $(event.target).parent().remove();
            swal("Poof", "Goal was deleted!", "success");
            $('.garden').html(`<h2>Nothing to see here</h2>`);
            //$('.list-goals').remove(`<div class="my-goals" value="${data.data.name}"><img class="seed" value="${data.data._id}" src="images/seedling.png"><p value="${data.data._id}">${data.data.name}</p></div>`);
            //$('.list-goals').remove(data.data._id);
        },
        error: function(error) {
            swal("Oh no!", "An error happened!", "error");
        }
    });
})