stage.waitToStart = false;

// Display horizontally part 2, part 6 and part 7.

stage.content = `

<form class='cols3'>
    <span>
        <div>
            <p
                id='part7Task1'
                class='comprehension'
                task-name='the <b>first task</b> in Part 6'
                task-name-und='the first task in Part 6'
                task-desc='to guess a number such that you thought one of two randomly selected contributions from Part 5 was greater than that number, and one was less than or equal to that number. <br><br><br>Please answer the following questions about this Task'
                id-prefix='part7Task1'>
            </p>
        </div>
        <div>
            <p
                id='part7Task2'
                class='comprehension'
                task-name='the <b>second task</b> in Part 6'
                task-name-und='the second task in Part 6'
                task-desc='to guess a number such that you thought one of four randomly selected contributions from Part 5 was greater than that number, and the other three were less than or equal to that number. <br><br>Please answer the following questions about this Task'
                id-prefix='part7Task2'>
            </p>
        </div>
        <div>
            <p
                id='part7Task3'
                class='comprehension'
                task-name='the <b>third task</b> in Part 6'
                task-name-und='the third task in Part 6'
                task-desc='to guess a number such that you thought three of four randomly selected contributions from Part 5 was greater than that number, and the other one was less than or equal to that number. <br><br>Please answer the following questions about this Task'
                id-prefix='part7Task3'>
            </p>
        </div>
    </span>

    <button>OK</button>
</form>

`

stage.waitToEnd = false;
