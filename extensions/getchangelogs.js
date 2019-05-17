const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = (context) => {
    context.getChangelogs = async () => {
        await getChangelogs(context);
    };
};

async function getChangelogs(context){
    const changeLogLocations = createChangelog(context);
    const allChanges = argigate(changeLogLocations);

    allChanges.sort(function(a,b){
        return new Date(b.date) - new Date(a.date);
    });

    
    //console.log(allChanges);
    showChangeLog(context, allChanges);
    /*
    const files = fs.readdirSync();
    console.log(files);
    */
}

function showChangeLog(context, allChanges){
    allChanges.forEach((log) => {
        if (!log.Minor){
            console.log(chalk`{bold ${log.versionNumber}} -  ${log.date} \n`);
            log.changes.forEach((changes) => {
                let match = changes.match(/(\*\*.+\*\*(?!$))/);
                if (match != null){
                    let markdownRemover = match[0].replace('**', '').replace('**', '');
                    console.log(changes.replace(match[0], chalk`{bold ${markdownRemover}}`));
                } else {
                    console.log(changes);
                }
                
            });
            console.log('\n');
        }
    });
}

function argigate(changeLogLocations){
    const allChanges = [];
    changeLogLocations.forEach((log) => {
        var data = fs.readFileSync(log,"utf8");
            //(\#+(?!$))

        result = data.split(/\#+\D(?!$)/);
        for(var i = 0; i < result.length; i++){
            let changes = {}
            
            let versionNumber = result[i].match(/(\[\d+[.]\S+.\d](?!$))/);

            if (versionNumber != null){
                changes['versionNumber'] = versionNumber[0];
                let dateNumber = result[i].match(/(\(\d{4}\-\d{2}\-\d{2}\)(?!$))/)[0];
                dateNumber = dateNumber.slice(0,dateNumber.length - 1).slice(1);
                changes['date'] = dateNumber;
                let changeResults = result[i].split('\n').filter(Boolean).filter(word => word.match('<a') == null);
                changeResults.shift();
                if (changeResults.length > 0 && changeResults[0].match(/(\*\*.+\*\*(?!$))/) != null){
                    changes['Minor'] = true;
                } else {
                    changes['Minor'] = false;
                }
                changes['changes'] = changeResults;
                var versionCheck = true;
                while (versionCheck && (i+1 < result.length)){
                    let checkVersionNumber = result[i+1].match(/(\[\d+[.]\S+.\d](?!$))/);
                    if (checkVersionNumber != null){
                        versionCheck = false;
                    } else {
                        i++;
                        let secondResults = result[i].split('\n').filter(Boolean).filter(word => word.match('<a') == null);
                        changes['changes'] = changes['changes'].concat(secondResults);
                    }
                }
                allChanges.push(changes);
            }

               
                
                
                
                //console.log(typeof blahs);

            }
            //console.log(result);
        
    });
    return allChanges;
}

function createChangelog(context){
    const changeLogs = [];
    context.runtime.plugins.forEach((plugin) => {
        const changelogPath = path.join(plugin.directory + '/CHANGELOG.md');
        if (fs.existsSync(changelogPath)){
            changeLogs.push(changelogPath);
        }
    });

    return changeLogs;
}