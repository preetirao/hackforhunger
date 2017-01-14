var Pie = function (name, yes, no, maybe) {
    this.chart = {
        renderTo: name,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    };

    this.title = {
        text: name
    };

    this.tooltip = {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    };

    this.plotOptions = {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    };

    this.series = [{
        name: 'answer',
        colorByPoint: true,
        data: [{
            name: 'Yes',
            y: yes
        }, {
            name: 'No',
            y: no,
        },{
            name: 'Maybe',
            y: maybe,
            sliced: true,
            selected: true
        }]
    }];
};

///////////////////////////////////////////////////////
var ConnectedBar = function(name, list, step) {
    this.chart = {
        renderTo: name,
        type: 'column'
    };
    this.title = {
            text: name
    };
    this.xAxis = {
            gridLineWidth: 1
    };
    this.yAxis = [{
            title: {
                text: name
            }
        }, {
            opposite: true,
            title: {
                text: 'Y value'
            }
        }];
    this.series = [{
            name: 'Amount',
            type: 'column',
            data: histogram(list, step),
            pointPadding: 0,
            groupPadding: 0,
            pointPlacement: 'between'
        }];
}
/////////////////////required function//////////////////////////////
function histogram(data, step) {
    var histo = {},
        x,
        i,
        arr = [];
    // Group down
    for (i = 0; i < data.length; i++) {
        x = Math.floor(data[i][0] / step) * step;
        if (!histo[x]) {
            histo[x] = 0;
        }
        histo[x]++;
    }
    // Make the histo group into an array
    for (x in histo) {
        if (histo.hasOwnProperty((x))) {
            arr.push([parseFloat(x), histo[x]]);
        }
    }
    // Finally, sort the array
    arr.sort(function (a, b) {
        return a[0] - b[0];
    });
    return arr;
}

$(document).ready(function() {
    var metricLabel = window.location.href.split("=")[1];
    metricLabelCapitalized = metricLabel.charAt(0).toUpperCase() + metricLabel.slice(1);
    $('.top-word').text(metricLabelCapitalized);
    $(document).prop('title', 'HackForHunger - ' + metricLabelCapitalized);

    $.ajax({
        url: "http://h4h-api.48yn9m8g4b.us-east-1.elasticbeanstalk.com/api/questionlabel",
        success: function(labeldata) {
            var questList = [];
            for (var item in labeldata) {
                if (labeldata[item].label.label == metricLabel) {
                    questList.push(labeldata[item].question);
                }
            }
            $.ajax({
                url: "http://h4h-api.48yn9m8g4b.us-east-1.elasticbeanstalk.com/api/questionmetric",
                success: function(metricdata) {
                    var metricList = []
                    for (qlitem in questList) {
                        for (metricitem in metricdata) {
                            if (questList[qlitem].id == metricdata[metricitem].question) {
                                metricdata[metricitem].metric.chartName = metricdata[metricitem].metric.metric_name;
                                metricList.push(metricdata[metricitem].metric)
                            }
                        }
                    }
                    $.ajax({
                        url: "http://h4h-api.48yn9m8g4b.us-east-1.elasticbeanstalk.com/api/metricresponse",
                        success: function(mrdata) {
                            for (metricitem in metricList) {
                                if (metricList[metricitem].metric_type.type == "yesNoMaybe") {
                                    var ynmcount = [0, 0, 0];
                                    for (mritem in mrdata) {
                                        if (mrdata[mritem].metric == metricList[metricitem].id) {
                                            if (mrdata[mritem].text_value == "yes")
                                                ynmcount[0]++
                                            else if (mrdata[mritem].text_value == "no")
                                                ynmcount[1]++
                                            else if (mrdata[mritem].text_value == "maybe")
                                                ynmcount[2]++
                                        }
                                    }
                                    $(".insertArea").append("<div id='" + metricList[metricitem].chartName + "' style='width:50%; height:300px; float: left; margin-bottom:20px; margin-top:20px; padding-left: 80px; padding-right: 80px''></div>");
                                    console.log(metricList[metricitem].chartName);
                                    console.log(ynmcount[0]);
                                    console.log(ynmcount[1]);
                                    console.log(ynmcount[2]);
                                    new Highcharts.chart(new Pie(metricList[metricitem].chartName, ynmcount[0], ynmcount[1], ynmcount[2]));
                                }
                                else if (metricList[metricitem].metric_type.type == "numeric") {
                                    var numArray = [];
                                    for (mritem in mrdata) {
                                        if (mrdata[mritem].metric == metricList[metricitem].id) {
                                            numArray.push([mrdata[mritem].numeric_value]);
                                        }
                                    }
                                    $(".insertArea").append("<div id='" + metricList[metricitem].chartName + "' style='width:50%; height:300px; float: left; margin-bottom:20px; margin-top:20px; padding-left: 80px; padding-right: 80px''></div>");
                                    new Highcharts.chart(new ConnectedBar(metricList[metricitem].chartName, numArray, 10));
                                }
                                else if (metricList[metricitem].metric_type.type == "sentiment") {
                                    var numArray2 = [];
                                    for (mritem in mrdata) {
                                        if (mrdata[mritem].metric == metricList[metricitem].id) {
                                            numArray2.push([mrdata[mritem].numeric_value]);
                                        }
                                    }
                                    $(".insertArea").append("<div id='" + metricList[metricitem].chartName + "' style='width:50%; height:300px; float: left; margin-bottom:20px; margin-top:20px; padding-left: 80px; padding-right: 80px''></div>");
                                    new Highcharts.chart(new ConnectedBar(metricList[metricitem].chartName, numArray2, 0.1));
                                }
                            }
                           
                            
                        },
                        failure: function(er) {
                            console.log(er)
                        }
                    })
                },
                failure: function(er) {
                    console.log(er)
                }
            })
        },
        failure: function(er) {
            console.log(er)
        }
    })
});