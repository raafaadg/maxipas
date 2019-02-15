let prompt = require('prompt-sync')();
require('dotenv').config();
let watson = require('watson-developer-cloud/assistant/v1');


// let chatbot = new watson({
//     username: process.env.REACT_APP_USERNAME_WATSON,
//     password: process.env.REACT_APP_PASSWORD,
//     version: process.env.REACT_APP_VERSION,
// });
let chatbot = new watson({
    username: 'a434b24b-056b-4676-9e6c-5362ac72fedb',
    password: 'zHP7iLqeWquI',
    version: '2018-02-16',
});
let workspace_id = '45a2b1dc-926f-42c4-adf9-fadd44c571d9';
// let workspace_id = process.env.WORKSPACE_ID;

let fimDeConversar = false;

function generateEntity(obj){
    let out = [];
    for (let i in obj.entities)
        out.push({
            value: obj.entities[i],
            synonyms: obj[obj.entities[i]]
        });
        return out;
}

function generateIntent(obj) {
    let out = [];
    for (let i in obj.examples)
        out.push({
            text: obj.examples[i]
        });
    return out;
}
function listDialogs(){
    let params = {
        workspace_id,
    };

    chatbot.listDialogNodes(params, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
}
function createNewIntent( intent, examples, description) {

    let params = {
        workspace_id,
        intent,
        examples,
        description
    };
    chatbot.createIntent(params, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
};

function createNewEntity( entity, values) {
    let params = {
        workspace_id,
        entity,
        values,
        fuzzy_match: true
    };
        
    chatbot.createEntity(params, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
}

function trataResposta(err, resposta) {
    if (err) {
        console.log(err);
        return;
    }

    if (resposta.intents.length) {
        console.log('Eu detectei a inteção: ' + resposta.intents[0].intent);
        if (resposta.intents[0].intent === 'General_Ending') {
            fimDeConversar = true;
        }
    }
    //exibe toda a json 
    console.log(resposta);

    if (resposta.output.text.length > 0) {
        console.log(resposta.output.text[0])
    }

    if (!fimDeConversar) {
        let mensagemUsuario = prompt('>>');
        chatbot.message({
            workspace_id,
            input: {
                text: mensagemUsuario
            },
            context: resposta.context
        }, trataResposta);
    }
}
function listWorkspaces(){
    chatbot.listWorkspaces(function (err, response) {
        if (err) {
            console.error(err);
        } else {
            // let jsonAUX = JSON.stringify(response, null, 2),
            //   key;
            // console.log(JSON.stringify(response, null, 2));
            let jsonAUX = JSON.parse(JSON.stringify(response, null, 2));
            console.log(jsonAUX.workspaces[0]);
            for (let key in jsonAUX.workspaces)
                console.log(jsonAUX.workspaces[key].workspace_id);
        }
    });
}


function skillObject(
    
    dialog_node,
    conditions,
    output,
    title,
    description,
    parent,
    next_step,
    previous_sibling,
    context,
    node_type,
    digress_in,
    digress_out,
    metadata,
    digress_out_slots,
    variable,
    event_name,
    actions,
    user_label
) {
    let obj = {};
    obj.workspace_id = workspace_id;
    obj.dialog_node = dialog_node;
    obj.new_conditions = conditions;
    obj.new_output = output;
    obj.new_title = title;
    obj.new_description = description;
    obj.new_parent = parent;
    obj.new_next_step = next_step;
    obj.new_previous_sibling = previous_sibling;
    obj.new_context = context;
    obj.new_type = node_type;
    obj.new_digress_in = digress_in;
    obj.new_digress_out = digress_out;
    obj.new_metadata = metadata;
    obj.new_digress_out_slots = digress_out_slots;
    obj.new_variable = variable;
    obj.new_event_name = event_name;
    obj.new_actions = actions;
    obj.user_label = user_label;
    return obj;
}

function createNewDialog(obj) {
    const obj2 = {};
    obj2.workspace_id = obj.workspace_id;
    obj2.dialog_node = obj.dialog_node;
    obj2.title = obj.new_title;
    obj2.description = obj.new_description;
    chatbot.createDialogNode(obj2, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
}

function updateDialog(obj) {
    chatbot.updateDialogNode(obj, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    });
}

function generateQuestionObject(obj,arrayEntities){
    let objectRet = [];
    let objAux = {};
    obj.forEach(element => {
        if(element.tag !== "" && element.sinonimo !== ""){
            objAux = {};
            objAux['entityTag'] = element.tag;
            objAux['entities'] = [element.tag];
            objAux[element.tag] = element.sinonimo.split(',');
            arrayEntities.push(objAux)
        }else{
            objAux = null;
        }
        objectRet.push({
            qst: element.frase,
            entity: objAux
        });
    });
    return [objectRet,arrayEntities];
}


function generateQuestion(obj, arrayDialog){
    const parent = 'folder_qsts';
    let i = 0;
    let previous_sibling = undefined;
    let contextAux = {};
    let nodeName = '';
    let nodeCount = '';
    let varEntity = '';
    let next_dialog_node = '';
    let entityControl = false;
    obj.forEach(element => {
        nodeName = 'node'+i;
        nodeCount = nodeName+'_count';
        contextAux = {};
        if(element.entity != null)
        {
            entityControl = true;
            varEntity = element.entity.entityTag;
        }else{
            entityControl = false;
        }

        if(i < (Object.keys(obj).length-1))
        {
            next_dialog_node = "node"+(i+1);

        }else
        {
            next_dialog_node = 'dialog_end';
        }
        if(entityControl)
        {   
            arrayDialog.push(skillObject(
                nodeName,
                'true',
                {
                    "text": {
                    "values": [
                        element.qst
                    ],
                    "response_type": "text",
                    "selection_policy": "random"
                    }
                },
                'Question Entity - ' + varEntity,
                'Dialogo de perguntas gerado automáticamente - '+ nodeName,
                parent,
                undefined,
                previous_sibling
            ));
            contextAux = {};
            contextAux[varEntity] = '@'+varEntity+'.literal';
            arrayDialog.push(skillObject(
                nodeName+1,
                '@'+varEntity,
                {
                    "text":{
                        "values":[
                            "Entidade " + varEntity + " cadastrada"
                        ]
                    }
                },
                'If Get ' + varEntity,
                'Dialogo para verificar se a entidade ' + varEntity + ' foi enconrada',
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: next_dialog_node
                },
                undefined,
                contextAux
            ));
            contextAux = {};
            contextAux[nodeCount] = "<?$" + nodeCount + "+1?>";
            arrayDialog.push(skillObject(
                nodeName+2,
                "anything_else&&"+nodeCount+"<2",
                {
                    "text":{
                        "values":[
                            "Não entendi sua resposta, favor reformular."
                        ]
                    }
                },
                'If Not Get ' + varEntity,
                'Dialogo para caso não encontre a entidade ' + varEntity,
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: nodeName
                },
                nodeName+1,
                contextAux               
            ));
            contextAux = {};
            contextAux[nodeCount] = "<? input.text ?>";
            arrayDialog.push(skillObject(
                nodeName+3,
                'anything_else',
                {
                    "text":{
                        "values":[
                            "A resposta informada foi armazenada!"
                        ]
                    }
                },
                'Get Any ' + varEntity,
                'Dialogo pra armazenar qualquer resposta fornecida',
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: next_dialog_node
                },
                nodeName+2,
                contextAux
            ));
        }else{
            arrayDialog.push(skillObject(
                nodeName,
                'true',
                {
                    "text": {
                    "values": [
                        element.qst
                    ],
                    "response_type": "text",
                    "selection_policy": "random"
                    }
                },
                'Question Boolean',
                'Dialogo de perguntas gerado automáticamente - '+ nodeName,
                parent,
                undefined,
                previous_sibling
            ));
            contextAux = {};
            contextAux["bool_"+nodeName] = '@resposta.literal';
            arrayDialog.push(skillObject(
                nodeName+1,
                '@resposta',
                {
                    "text":{
                        "values":[
                            "Resposta registrada -> <?entities[0].value?>"
                        ]
                    }
                },
                'If Get',
                'Dialogo para verificar se a resposta foi positiva',
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: next_dialog_node
                },
                undefined,
                contextAux
            ));
            contextAux = {};
            contextAux[nodeCount] = "<?$" + nodeCount + "+1?>";
            arrayDialog.push(skillObject(
                nodeName+2,
                "anything_else&&"+nodeCount+"<2",
                {
                    "text":{
                        "values":[
                            "Não entendi sua resposta, favor reformular."
                        ]
                    }
                },
                'If Not Get Entity @resposta',
                'Dialogo para caso não encontre a entidade resposta',
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: nodeName
                },
                nodeName+1,
                contextAux
            ));
            contextAux = {};
            contextAux[nodeCount] = "<? input.text ?>";
            arrayDialog.push(skillObject(
                nodeName+3,
                'anything_else',
                {
                    "text":{
                        "values":[
                            "A resposta informada foi armazenada!"
                        ]
                    }
                },
                'Get Any Entity',
                'Dialogo pra armazenar qualquer resposta fornecida',
                nodeName,
                {
                    behavior: "jump_to",
                    selector: "condition",
                    dialog_node: next_dialog_node
                },
                nodeName+2,
                contextAux
            ));
        }
        previous_sibling = nodeName;
        i++;
    });
    return arrayDialog
}

module.exports = {
    chatbot,
    createNewEntity,
    createNewIntent,
    createNewDialog,
    trataResposta,
    listWorkspaces,
    listDialogs,
    generateEntity,
    generateIntent,
    skillObject,
    updateDialog,
    generateQuestion,
    generateQuestionObject,
    workspace_id
}