var canvas = document.querySelector('#floor-plan');
var ctx = canvas.getContext('2d');
const scaleFactor = 0.5;

function processForm() {

    event.preventDefault();
    var cWidth = parseInt(document.querySelector('#c-width-input').value);
    var cLength = parseInt(document.querySelector('#c-length-input').value);
    var minDist = parseInt(document.querySelector('#min-dist-input').value);
    var minDesk = parseInt(document.querySelector('#min-desk-input').value);

    //Draws a circle in the given x and y coordinate values

    function drawDesk(x, y) {
        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = 0.2;
        ctx.arc(x, y, setFtSize() * 3, 0, (2 * Math.PI));
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(x, y, setFtSize() * 0.25, 0, (2 * Math.PI));
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.beginPath();
        ctx.restore();
        console.log('Desk Drawn!');
    }

    //Sets the scale of the rendering based on a scale factor

    function setFtSize() {
        return 100 * scaleFactor;
    }

    //----------------------------- Straight Desk Calculations -----------------------------

    //Finds the max amount of desks that can fit in a row while complying with the minimum distance

    function firstRowMax() {
        return Math.floor((cWidth / minDist) + 1);
    }

    //Finds the maximum amount of rows based on the minimum distance and the length. Rounds the given value downwards

    function maxRows() {
        return Math.floor((cLength / minDist) + 1);
    }

    //Calculates the maximum amount of rows desks on the amount of rows and desks per row

    function maxDesk() {
        return firstRowMax() * maxRows();
    }

    function neededRows() {
        return Math.ceil(minDesk / firstRowMax());
    }

    function neededLength() {
        return minDist * (neededRows() - 1) 
    }

    function neededWidth() {
        return minDist * (firstRowMax() - 1);
    }

    //----------------------------- Staggered Desk Calculations -----------------------------

    //Finds the max amount of desks that can fit in a row while complying with the minimum distance

    function firstRowMaxStag() {
        return Math.floor((cWidth / minDist) + 1);
    }
    
    //Subtracts a desk from the first row amount so the second row can be staggered

    function secondRowMaxStag() {
        return firstRowMaxStag() - 1
    }
    
    //Calculates the distance needed between the rows

    function rowLengthDistStag(x) {
        let s = (x + (minDist * 2)) / 2;
        let area = Math.sqrt(s * (s - x) * Math.pow((s - minDist) , 2));
        return Math.round((2 * (area / x)) * 10) / 10;
    }

    //Calculates the maximum amount of rows based on the length and the distance between the rows. Rounds the given value upwards
    
    function maxRowsStag() {
        return Math.ceil((cLength / (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1)) - 1)));
    }

    //Counts the maximum amount of desks based on the max row and first and second row amount values
    
    function maxDeskStag() {
        if (maxRows()%2 == 0) {
            return ((secondRowMaxStag() + firstRowMaxStag()) * maxRowsStag() / 2);
        } else {
            return (((secondRowMaxStag() + firstRowMaxStag()) * (maxRowsStag() - 1) / 2) + firstRowMaxStag());
        }
    }

    //Calculates the amount of rows needed to accomodate all the desks

    function neededRowsStag() {
        let deskNumber = 0;
        let rowNumber = 0;
        for (i = 0; i < minDesk; i++) {
            if ((rowNumber % 2 == 0 && deskNumber < firstRowMax()) || (rowNumber % 2 !== 0 && deskNumber < secondRowMaxStag())) {
                deskNumber ++;
            } else if (rowNumber % 2 == 0 && deskNumber == firstRowMax() || rowNumber % 2 !== 0 && deskNumber == secondRowMaxStag()) {
                deskNumber = 0;
                rowNumber ++;
                i --;
            }
        }
        return rowNumber;
    }

    function neededLengthStag() {
        return (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) * (neededRowsStag());
    }

    //----------------------------- Rendering and Front End Manipulation -----------------------------

    //Checks if the maximum amount of desks is less than the minimum amount of desks and alerts the user

    function maxDeskCheck() {
        if (maxDesk() < minDesk) {
            window.alert('There is not enough space for all the desks!\nThe maximum amount of desks in this space is ' + maxDesk());
            return false;
        } else {
            return true;
        }
    }

    function maxDeskCheckStag() {
        if (maxDeskStag() < minDesk) {
            window.alert('There is not enough space for all the desks!\nThe maximum amount of desks in this space is ' + maxDeskStag());
            return false;
        } else {
            return true;
        }
    }

    //Renders universal elements

    function universalRender() {
        
        //Clears the canvas of any content

        function clearCanvas() {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        
        //Resizes the canvas based on the measurments of the space. Prioritizes the longer length

        function resizeCanvas(x) {
            canvas.width = ((cWidth + 8) * x);
            if (neededLengthStag() < cLength) {
                canvas.height = ((cLength + 8) * x);
            } else {
                canvas.height = ((neededLengthStag() + 8) * x);
            }
            console.log('Canvas Width = ' + canvas.width);
            console.log('Canvas Height = ' + canvas.height);
        }
        
        //Draws the ruler along the x-axis which shows the total width

        function drawWidthRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((x * 2), (x * 1));
            ctx.lineTo((x * (2 + cWidth)), (x * 1));
            ctx.moveTo((x * 2), (x * 0.75));
            ctx.lineTo((x * 2), (x * 1.25));
            ctx.moveTo((x * (2 + cWidth)), (x * 0.75));
            ctx.lineTo((x * (2 + cWidth)), (x * 1.25));
            ctx.stroke();
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(cWidth + ' ft. (Width Available)', (((cWidth / 2) + 2) * x), (x * 0.75));
            ctx.restore();
        }

        //Draws a ruler on the right y-axis which shows the length of the space available

        function drawLengthRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((canvas.width - (x * 1)), (x * 6));
            ctx.lineTo((canvas.width - (x * 1)), (x * (6 + cLength)));
            ctx.moveTo((canvas.width - (x * 0.75)), (x * 6));
            ctx.lineTo((canvas.width - (x * 1.25)), (x * 6));
            ctx.moveTo((canvas.width - (x * 0.75)), (x * (6 + cLength)));
            ctx.lineTo((canvas.width - (x * 1.25)), (x * (6 + cLength)));
            ctx.stroke();
            ctx.translate((canvas.width - (x * 0.5)), (((cLength / 2) + 6) * x));
            ctx.rotate(90 * Math.PI/180);
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(cLength + ' ft. (Available Length)', (cLength / 2), (x * 0.25));
            ctx.restore();
        }

        clearCanvas();
        resizeCanvas(setFtSize());
        drawWidthRuler(setFtSize());
        drawLengthRuler(setFtSize());

    }

    function straightDeskRender() {

        //Draws a ruler in the middle y-axis which shows the length of the space needed

        function drawUsedRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((canvas.width - (x * 2)), (x * 6));
            ctx.lineTo((canvas.width - (x * 2)), (x * (6 + neededLength())));
            ctx.moveTo((canvas.width - (x * 1.75)), (x * 6));
            ctx.lineTo((canvas.width - (x * 2.25)), (x * 6));
            ctx.moveTo((canvas.width - (x * 1.75)), (x * (6 + neededLength())));
            ctx.lineTo((canvas.width - (x * 2.25)), (x * (6 + neededLength())));
            ctx.stroke();
            ctx.translate(canvas.width - (x * 1.5), (((neededLength() / 2) + 6) * x))
            ctx.rotate(90 * Math.PI/180);
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(neededLength() + ' ft. (Total Length Needed)', (cLength / 2), (x * 0.25));
            ctx.restore();
        }

        //Draws a ruler showing the distance between rows

        function drawRowRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((canvas.width - (x * 3)), (x * 6));
            ctx.lineTo((canvas.width - (x * 3)), (x * (6 + minDist)));
            ctx.moveTo((canvas.width - (x * 2.75)), (x * 6));
            ctx.lineTo((canvas.width - (x * 3.25)), (x * 6));
            ctx.moveTo((canvas.width - (x * 2.75)), (x * (6 + minDist)));
            ctx.lineTo((canvas.width - (x * 3.25)), (x * (6 + minDist)));
            ctx.stroke();
            ctx.translate(canvas.width - (x * 2.5), (((minDist / 2) + 6) * x));
            ctx.rotate(90 * Math.PI/180);
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(minDist + ' ft.', (minDist / 2), (x * 0.25));
            ctx.restore();
        }

        //Draws a ruler showing the width needed for the layout

        function drawNeededWidthRuler(x) {
            console.log(neededWidth());
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((x * 2), (x * 2));
            ctx.lineTo((x * (2 + neededWidth())), (x * 2));
            ctx.moveTo((x * 2), (x * 1.75));
            ctx.lineTo((x * 2), (x * 2.25));
            ctx.moveTo((x * (2 + neededWidth())), (x * 1.75));
            ctx.lineTo((x * (2 + neededWidth())), (x * 2.25));
            ctx.stroke();
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(neededWidth() + ' ft. (Total Width Needed)', (((neededWidth() / 2) + 2) * x), (x * 1.75));
            ctx.restore();
        }

        //Draws a ruler showing the distance between desks

        function drawDeskRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((x * 2), (x * 3));
            ctx.lineTo((x * (2 + minDist)), (x * 3));
            ctx.moveTo((x * 2), (x * 2.75));
            ctx.lineTo((x * 2), (x * 3.25));
            ctx.moveTo((x * (2 + minDist)), (x * 2.75));
            ctx.lineTo((x * (2 + minDist)), (x * 3.25));
            ctx.stroke();
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(minDist + ' ft.', ((((cWidth / (firstRowMax() - 1)) / 2) + 2) * x), (x * 2.75));
            ctx.restore();
        }

        //Function to render the desks in a straight row pattern

        function renderDesks(ft) {
            console.log('Rendering Desks!');
            let deskNumber = 0;
            let rowNumber = 0;
            for (i = 0; i < minDesk; i++){
                if (deskNumber < firstRowMax()) {
                    drawDesk((((minDist * deskNumber) + 2) * ft), (((minDist * rowNumber) + 6) * ft));
                    deskNumber ++;
                } else if (deskNumber == firstRowMax()) {
                    deskNumber = 0;
                    rowNumber ++;
                    i --;
                } else {
                    return false;
                }
            }
        }

        if (neededRows() > 1) {
            drawRowRuler(setFtSize());
        }

        if (minDesk > 1) {
            drawDeskRuler(setFtSize());
            drawNeededWidthRuler(setFtSize());
        }

        drawUsedRuler(setFtSize());
        renderDesks(setFtSize());
    }

    function staggeredDeskRender() {

        //Draws a ruler in the middle y-axis which shows the length of the space needed

        function drawUsedRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((canvas.width - (x * 2)), (x * 6));
            ctx.lineTo((canvas.width - (x * 2)), (x * (6 + neededLengthStag())));
            ctx.moveTo((canvas.width - (x * 1.75)), (x * 6));
            ctx.lineTo((canvas.width - (x * 2.25)), (x * 6));
            ctx.moveTo((canvas.width - (x * 1.75)), (x * (6 + neededLengthStag())));
            ctx.lineTo((canvas.width - (x * 2.25)), (x * (6 + neededLengthStag())));
            ctx.stroke();
            ctx.translate(canvas.width - (x * 1.5), (((neededLengthStag() / 2) + 6) * x))
            ctx.rotate(90 * Math.PI/180);
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(neededLengthStag() + ' ft. (Total Length Needed)', (cLength / 2), (x * 0.25));
            ctx.restore();
        }

        //Draws a ruler showing the distance between rows

        function drawRowRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((canvas.width - (x * 3)), (x * 6));
            ctx.lineTo((canvas.width - (x * 3)), (x * (6 + (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))))));
            ctx.moveTo((canvas.width - (x * 2.75)), (x * 6));
            ctx.lineTo((canvas.width - (x * 3.25)), (x * 6));
            ctx.moveTo((canvas.width - (x * 2.75)), (x * (6 + (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))))));
            ctx.lineTo((canvas.width - (x * 3.25)), (x * (6 + (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))))));
            ctx.stroke();
            ctx.translate(canvas.width - (x * 2.5), (((rowLengthDistStag(cWidth / (firstRowMaxStag() - 1)) / 2) + 6) * x));
            ctx.rotate(90 * Math.PI/180);
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) + ' ft.', (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1)) / 2), (x * 0.25));
            ctx.restore();
        }

        //Draws a ruler showing the offset needed for staggering

        function drawStaggerRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((x * 2), (x * 3));
            ctx.lineTo((x * (2 + (cWidth / (firstRowMaxStag() - 1))) / 2), (x * 3));
            ctx.moveTo((x * 2), (x * 2.75));
            ctx.lineTo((x * 2), (x * 3.25));
            ctx.moveTo((x * (2 + (cWidth / (firstRowMaxStag() - 1))) / 2), (x * 2.75));
            ctx.lineTo((x * (2 + (cWidth / (firstRowMaxStag() - 1))) / 2), (x * 3.25));
            ctx.stroke();
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(((cWidth / (firstRowMaxStag() - 1)) / 2) + ' ft.', ((((cWidth / (firstRowMaxStag() - 1)) / 6) + 2) * x), (x * 2.75));
            ctx.restore();
        }

        //Draws a ruler showing the distance between desks

        function drawDeskRuler(x) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.moveTo((x * 2), (x * 2));
            ctx.lineTo((x * (2 + (cWidth / (firstRowMaxStag() - 1)))), (x * 2));
            ctx.moveTo((x * 2), (x * 1.75));
            ctx.lineTo((x * 2), (x * 2.25));
            ctx.moveTo((x * (2 + (cWidth / (firstRowMaxStag() - 1)))), (x * 1.75));
            ctx.lineTo((x * (2 + (cWidth / (firstRowMaxStag() - 1)))), (x * 2.25));
            ctx.stroke();
            ctx.font = (x * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((cWidth / (firstRowMaxStag() - 1)) + ' ft.', ((((cWidth / (firstRowMaxStag() - 1)) / 2) + 2) * x), (x * 1.75));
            ctx.restore();
        }

        //Function to render the desks in a staggered pattern

        function renderDesks(ft) {
            console.log('Rendering Desks!');
            let deskNumber = 0;
            let rowNumber = 0;
            for (i = 0; i < minDesk; i++){
                if (rowNumber % 2 == 0 && deskNumber < firstRowMaxStag()) {
                    drawDesk((ft * (cWidth / (firstRowMaxStag() - 1) * deskNumber) + (ft * 2)), (ft * (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) * rowNumber) + (ft * 6));
                    deskNumber ++;
                } else if (rowNumber % 2 !== 0 && deskNumber < secondRowMaxStag()) {
                    console.log(deskNumber);
                    console.log(rowNumber);
                    drawDesk((ft * (cWidth / (firstRowMaxStag() - 1) * deskNumber) + (ft * 2)) + ft * ((cWidth / (firstRowMaxStag() - 1)) / 2), (ft * (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) * rowNumber) + (ft * 6));
                    deskNumber ++;
                } else if (rowNumber % 2 == 0 && deskNumber == firstRowMaxStag() || rowNumber % 2 !== 0 && deskNumber == secondRowMaxStag()) {
                    deskNumber = 0;
                    rowNumber++;
                    i--
                } else {
                    return false;
                }
            }
        }

        if (neededRowsStag() > 0) {
            drawUsedRuler(setFtSize());
            drawRowRuler(setFtSize());
        }

        if (minDesk > 1) {
            drawDeskRuler(setFtSize());
        }

        renderDesks(setFtSize());
    }

    //Runs the calculations and shows the most efficient layout to the user

    function runCalc() {
        if (neededLength() < neededLengthStag()) {

            console.log('Straight');
            document.querySelector('#first-row-max').innerHTML = ('Desks in First Row: ' + firstRowMax());
            document.querySelector('#second-row-max').innerHTML = ('Desks in Second Row: ' + firstRowMax());
            document.querySelector('#dist-between-desk').innerHTML = ('Distance Between Desks in a Row: ' + minDist + ' ft');
            document.querySelector('#dist-between-rows').innerHTML = ('Distance Between Rows: ' + minDist + ' ft');
            document.querySelector('#max-rows').innerHTML = ('Maximum Rows: ' + maxRows());
            document.querySelector('#max-desk').innerHTML = ('Maximum Desks: ' + maxDesk());
            document.querySelector('#total-length').innerHTML = ('Total Length Needed: ' + neededLength() + ' ft');
            maxDeskCheck();
            universalRender();
            straightDeskRender();

        } else if (neededLengthStag() < neededLength()) {

            console.log('Staggered');
            document.querySelector('#first-row-max').innerHTML = ('Desks in First Row: ' + firstRowMaxStag());
            document.querySelector('#second-row-max').innerHTML = ('Desks in Second Row: ' + secondRowMaxStag());
            document.querySelector('#dist-between-desk').innerHTML = ('Distance Between Desks in a Row: ' + (cWidth / (firstRowMaxStag() - 1)) + ' ft');
            document.querySelector('#dist-between-rows').innerHTML = ('Distance Between Rows: ' + (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) + ' ft');
            document.querySelector('#max-rows').innerHTML = ('Maximum Rows: ' + maxRowsStag());
            document.querySelector('#max-desk').innerHTML = ('Maximum Desks: ' + maxDeskStag());
            document.querySelector('#total-length').innerHTML = ('Total Length Needed: ' + neededLengthStag() + ' ft');
            maxDeskCheckStag();
            universalRender();
            staggeredDeskRender();

        } else {

            console.log('Staggered');
            document.querySelector('#first-row-max').innerHTML = ('Desks in First Row: ' + firstRowMaxStag());
            document.querySelector('#second-row-max').innerHTML = ('Desks in Second Row: ' + secondRowMaxStag());
            document.querySelector('#dist-between-desk').innerHTML = ('Distance Between Desks in a Row: ' + (cWidth / (firstRowMaxStag() - 1)) + ' ft');
            document.querySelector('#dist-between-rows').innerHTML = ('Distance Between Rows: ' + (rowLengthDistStag(cWidth / (firstRowMaxStag() - 1))) + ' ft');
            document.querySelector('#max-rows').innerHTML = ('Maximum Rows: ' + maxRowsStag());
            document.querySelector('#max-desk').innerHTML = ('Maximum Desks: ' + maxDeskStag());
            document.querySelector('#total-length').innerHTML = ('Total Length Needed: ' + neededLengthStag() + ' ft');
            maxDeskCheckStag();
            staggeredDeskRender();
        }
    }

    runCalc();

}

//Draws words on the canvas for decoration

function drawWords() {
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Floor Plan Will Generate Here', 320, 180);
}

drawWords();