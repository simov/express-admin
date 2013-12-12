
var options = {
    january: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$136.00 spend for goods in january"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"coffee","y":61.4,"total":83},{"name":"tea","y":27.57,"total":37},{"name":"cherries","y":11.03,"total":15}]}]}',
    february: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$138.90 spend for goods in february"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"coffee","y":13.61,"total":18},{"name":"tea","y":71.99,"total":100},{"name":"cherries","y":14.4,"total":20}]}]}',
    mart: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$80.50 spend for goods in mart"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"tea","y":66.46,"total":53},{"name":"energy","y":22.36,"total":18},{"name":"chocolate","y":11.18,"total":9}]}]}',
    april: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$114.80 spend for goods in april"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"coffee","y":10.98,"total":12},{"name":"tea","y":13.94,"total":16},{"name":"energy","y":38.76,"total":44},{"name":"cherries","y":19.77,"total":22},{"name":"chocolate","y":16.55,"total":19}]}]}',
    may: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$65.80 spend for goods in may"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"tea","y":60.79,"total":40},{"name":"energy","y":25.53,"total":16},{"name":"cherries","y":13.68,"total":9}]}]}',
    june: '{"chart":{"renderTo":"chart-pie","plotBackgroundColor":null,"plotBorderWidth":null,"plotShadow":false},"title":{"text":"$185.00 spend for goods in june"},"tooltip":{"pointFormat":"{series.name}: <b>{point.percentage}%</b>","percentageDecimals":1,"formatter":"all callback functions are defined in the browser!"},"plotOptions":{"pie":{"allowPointSelect":true,"cursor":"pointer","dataLabels":{"enabled":true,"color":"#000000","connectorColor":"#000000","formatter":"all callback functions are defined in the browser!"}}},"series":[{"type":"pie","name":"Spend","data":[{"name":"coffee","y":37.84,"total":70},{"name":"tea","y":21.62,"total":40},{"name":"energy","y":30.27,"total":56},{"name":"chocolate","y":10.27,"total":19}]}]}'
};

$(function () {
    // remove the inline js from the custom view!

    function createChart (month) {
        var settings = JSON.parse(options[month]);
    
        // can't have functions in json
        settings.tooltip.formatter = function () {
            return '<strong>'+this.point.name+'</strong>: $'
                    +this.point.options.total;
        };
        // so the callbacks are here
        settings.plotOptions.pie.dataLabels.formatter = function () {
            return '<strong>'+this.point.name+'</strong>: '
                    +parseFloat(this.percentage.toFixed(2))+'%';
        }
    
        // create the chart
        var pieChart = new Highcharts.Chart(settings);
    }

    createChart('january');

    $('[name=month]').on('change', function (e) {
        createChart($(this).val());
    });
});
