/**
  * @desc Synchonous function that maps from frames to source concepts.
  *       It computes a score based on the fraction of words that overlap.
  *       And returns a list of associative arrays.
  * @param string frameName - the fullpagename of 
  * @param string $mdiv - (jquery wrapped) div to write data to in data-return
*/
function getFrameLUs(frameName) {
    var apiUrl = mw.config.get('wgScriptPath') + '/api.php';
    var lposquery = '[[-Has subobject::'+frameName+']]|?Has lemma';
    return $.ajax({
        url: apiUrl,
        data: {'action':'ask','format':'json','query':lposquery},
        dataType:'json',
        type:'POST',
        headers: { 'Api-User-Agent': 'Example/1.0' }
    }).then(function(data){
        var lemmalist = data['query']['results'][frameName+'#Lexical unit of']['printouts']['Has lemma'];
        return [frameName, lemmalist];
    });
}

function getConceptWords(conceptName) {
    var apiUrl = mw.config.get('wgScriptPath') + '/api.php';
    var wordquery = '[['+conceptName+']]|?HasConceptLU';
    return $.ajax({
        url: apiUrl,
        data: {'action':'ask','format':'json','query':wordquery},
        dataType:'json',
        type:'POST',
        headers: { 'Api-User-Agent': 'Example/1.0' }
    }).then(function(data){
        var wordlist = data['query']['results'][conceptName]['printouts']['HasConceptLU'];
        return wordlist;
    });
}

function getRelevantFrameLUListForConcept(wordList) {
    var apiUrl = mw.config.get('wgScriptPath') + '/api.php';
    var fquery = '[[Has lemma::' + wordList.join('||') + ']]|?Has lemma';
    return $.ajax({
        url: apiUrl,
        data: {'action':'ask','format':'json','query':fquery},
        dataType:'json',
        type:'POST',
        headers: { 'Api-User-Agent': 'Example/1.0' }
    }).then(function(data){
        var frameLUList = []
        $.each(data['query']['results'], function(framekey, val) {
            var frameName = framekey.split('#')[0];
            var lemmaList = val['printouts']['Has lemma'];
            frameLUList.push([frameName, lemmaList]);
        });
        return frameLUList;
    });
}

function mapFrameLUsToConcept(frameLUs) {
    var apiUrl = mw.config.get('wgScriptPath') + '/api.php';
    var frameName = frameLUs[0];
    var lemmalist = frameLUs[1];
    var concquery = '[[Category:IARPASourceConcept]][[HasConceptLU::'
                    +lemmalist.join('||')+']]|?HasConceptLU';
    return $.ajax({
        url: apiUrl,
        data: {'action':'ask','format':'json','query':concquery},
        dataType:'json',
        type:'POST',
        headers: {'Api-User-Agent': 'Example/1.0' }
    }).then(function computeMappingScoreTuples(result){
        var tuples = [];
        var so = setOps;
        $.each(result['query']['results'], function(concept, condata) {
            conclulist = condata['printouts']['HasConceptLU'];
            common = so.intersection(lemmalist,conclulist);
            merged = so.union(lemmalist,conclulist);
            score = common.length * 1.0 / merged.length;
            tuples.push([concept, score, common]);  
        });
        tuples.sort(function(a, b) {
            a = a[1];
            b = b[1];
            return a > b ? -1 : (a < b ? 1 : 0);
        });
        var resultobjs = [];
        for (var i = 0; i < tuples.length; i++) {
            var mapping = {'concept':tuples[i][0],
                'rank':i+1,
                'score':tuples[i][1],
                'words':tuples[i][2].sort()};
            resultobjs.push(mapping);
        };
        return [frameName, resultobjs];
    });
}

$(document).ready(function(){
    var opts = {
        lines: 9 // The number of lines to draw
        , length: 4 // The length of each line
        , width: 3 // The line thickness
        , radius: 4 // The radius of the inner circle
        , scale: 1.5 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.1 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '5%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'relative' // Element positioning
    };
    var indexUrl = mw.config.get('wgScriptPath') + '/index.php/';
    $('div.mapframetoconcept').each(function mapFramesToConcept(){
        var $mdiv = $(this);
        var frameName = $mdiv.data("frame");
        var spinner = new Spinner(opts).spin();
        $mdiv.append(spinner.el);
        getFrameLUs(frameName).then(mapFrameLUsToConcept).then(function(framemappings){
            var mappings = framemappings[1];
            var mstrings = [];
            for (var i = 0; i < mappings.length; i++) {
                var mapping = mappings[i]
                var mstr = '<tt>#'+mapping['rank']+'</tt>: <a href="'+indexUrl+mapping['concept']+'">'+
                    mapping['concept'].replace('IConcept:','')+'</a> ('+mapping['score'].toFixed(2)+
                    '; '+mapping['words']+')';
                mstrings.push(mstr);
            };
            spinner.stop();
            $mdiv.append(mstrings.join('<br/>'));
        });
    });
    $('div.getmappingstoconcept').each(function getFrameMappingsToConcept(){
        var $mdiv = $(this);
        var conceptName = $mdiv.data("concept");
        var spinner = new Spinner(opts).spin();
        $mdiv.append(spinner.el);
        getConceptWords(conceptName).then(getRelevantFrameLUListForConcept).then(
            function(frameLuList){
                $.when.apply($, $.map(frameLuList, mapFrameLUsToConcept)).done(function(){
                    var finalMappings = [];
                    $.each(arguments, function(i, data) {
                        var frameName = data[0];
                        var mappingList = data[1];
                        $.each(mappingList, function(i, mapping){
                            var conc = mapping['concept'];
                            var rank = mapping['rank'];
                            var score = mapping['score'];
                            var wlist = mapping['words'];
                            if (conc == conceptName) {
                                finalMappings.push([rank, frameName, score, wlist]);
                            }
                        });
                    });
                    finalMappings.sort(function(a, b) {
                        ranka = a[0];
                        rankb = b[0];
                        if (ranka == rankb) {
                            scorea = a[2];
                            scoreb = b[2];
                            return scorea > scoreb ? -1 : (scorea < scoreb ? 1 : 0);
                        }
                        return ranka < rankb ? -1 : (ranka > rankb ? 1 : 0);
                    });
                    var mstrings = $.map(finalMappings, function(mapping) {
                        var frname = mapping[1].replace('Frame:','');
                        if (mapping[0] < 3) {
                            frname = '<b>'+frname+'</b>';
                        }
                        mapstr = '<tt>#'+mapping[0]+'</tt>: <a href="'+indexUrl+
                            mapping[1]+'">'+frname+'</a> ('+mapping[2].toFixed(2)+
                                                          '; '+mapping[3].join()+')'
                        return mapstr;
                    });
                    spinner.stop();
                    $mdiv.append(mstrings.join('<br/>'));
                });
            });
    });
});
