const { default: axios } = require("axios");

class InferenceClient {
  constructor(
    handler,
    recieveApiResponse,
    returnSummary,
    notify,
    instructionFormats,
    parameters,
    endpoints
  ) {
    this.handler = handler;
    this.callback = recieveApiResponse;
    this.returnSummary = returnSummary;
    this.notify = notify;
    this.instructSet = {};
    this.instructionFormats = instructionFormats;
    this.parameterFormats = parameters.params;
    this.parameters = parameters.default;
    this.endpoints = endpoints;
    this.lastOutpoint = "";
    this.storeparams = parameters.default;
  }
  setOnePromptFormat(setting, value) {
    this.instructSet[setting] = value;
  }
  setParams(params){
    this.parameters = params;
  }
  setPromptFormat(setting) {
    try {
      let bos = "";
      if (setting.bos != undefined) {
        bos = setting.bos;
      }
      let eos = "";
      if(setting.eos != undefined){
        eos = setting.eos;
      }
      let startTurn = "";
      if (setting.startTurn != undefined) {
        startTurn = setting.startTurn;
      }
      let endTurn = "";
      if (setting.endTurn != undefined) {
        endTurn = setting.endTurn;
      }
      let startSystem = "";
      if (setting.startSystem != undefined) {
        startSystem = setting.startSystem;
      }
      let startUser = "";
      if (setting.startUser != undefined) {
        startUser = setting.startUser;
      }
      let startAssistant = "";
      if (setting.startAssistant != undefined) {
        startAssistant = setting.startAssistant;
      }
      let endSystemTurn = "";
      if (setting.endSystemTurn != undefined) {
        endSystemTurn = setting.endSystemTurn;
      }
      let endUserTurn = "";
      if (setting.endUserTurn != undefined) {
        endUserTurn = setting.endUserTurn;
      }
      let endAssistantTurn = "";
      if (setting.endAssistantTurn != undefined) {
        endAssistantTurn = setting.endAssistantTurn;
      }
      let systemRole = "";
      if (setting.systemRole != undefined) {
        systemRole = setting.systemRole;
      }
      let endSystemRole = "";
      if (setting.endUserRole != undefined) {
        endSystemRole = setting.endSystemRole;
      }
      let userRole = "";
      if (setting.userRole != undefined) {
        userRole = setting.userRole;
      }
      let endRole = "";
      if (setting.endRole != undefined) {
        endRole = setting.endRole;
      }
      let roleGap = "";
      if (setting.roleGap != undefined) {
        roleGap = setting.roleGap;
      }
      let endUserRole = "";
      if (setting.endUserRole != undefined) {
        endUserRole = setting.endUserRole;
      }
      let assistantRole = "";
      if (setting.assistantRole != undefined) {
        assistantRole = setting.assistantRole;
      }
      let endAssistantRole = "";
      if (setting.endAssistantRole != undefined) {
        endAssistantRole = setting.endAssistantRole;
      }
      let prependPrompt = "";
      if (setting.prependPrompt != undefined) {
        prependPrompt = setting.prependPrompt;
      }
      let systemAfterPrepend = "";
      if (setting.systemAfterPrepend != undefined) {
        systemAfterPrepend = setting.systemAfterPrepend;
      }
      let postPrompt = "";
      if (setting.postPrompt != undefined) {
        postPrompt = setting.postPrompt;
      }
      let memorySystem = "";
      if (setting.memorySystem != undefined) {
        memorySystem = setting.memorySystem;
      }
      let memoryUser = "";
      if (setting.memoryUser != undefined) {
        memoryUser = setting.memoryUser;
      }
      let responseStart = "";
      if (setting.responseStart != undefined) {
        responseStart = setting.responseStart;
      }
      let specialInstructions = "";
      if (setting.specialInstructions != undefined) {
        specialInstructions = setting.specialInstructions;
      }

      this.instructSet = {
        bos: bos,
        eos: eos,
        startTurn: startTurn,
        endTurn: endTurn,
        startSystem: startSystem,
        startUser: startUser,
        startAssistant: startAssistant,
        endSystemTurn: endSystemTurn,
        endUserTurn: endUserTurn,
        endAssistantTurn: endAssistantTurn,
        systemRole: systemRole,
        endSystemRole: endSystemRole,
        userRole: userRole,
        endUserRole: endUserRole,
        endRole: endRole,
        roleGap: roleGap,
        assistantRole: assistantRole,
        endAssistantRole: endAssistantRole,
        prependPrompt: prependPrompt,
        systemAfterPrepend: systemAfterPrepend,
        postPrompt: postPrompt,
        memorySystem: memorySystem,
        memoryUser: memoryUser,
        responseStart: responseStart,
        specialInstructions: specialInstructions
      };
    } catch (error) {
      console.log(
        "setPromptFormat error: " +
          error +
          " \n Please ensure you are using a valid key in setup.js promptFormats"
      );
    }
    console.log("prompt format set: " + JSON.stringify(this.instructSet));
  }
  //|||code|instead of destructruing, take each value and check if it's undefined, as is done to the bos value.

  setFormat(format) {
    try {
      this.instructSet = this.instructionFormats[format];
    } catch (error) {
      console.log("invalid format: " + error);
    }
  }
  completionMessageBuilder(identity, userQuery, params, api) {
    const instruct = this.instructSet;
    //console.log(JSON.stringify(this.instructSet));
    if (api.model) {
      params.model = api.model;
    }

    let outIdentity = ""; //identityStringifyNoKey(identity);
    if (api.jsonSystem != undefined) {
      if (api.jsonSystem === "full") {
        outIdentity = JSON.stringify(identity);
      } else if (api.jsonSystem === "keys") {
        outIdentity = this.identityStringifier(identity);
      } else if (api.jsonSystem === "markup") {
        outIdentity = this.systemPromptBuilder(identity);
      } else if (api.jsonSystem === "none") {
        outIdentity = this.identityStringifyNoKey(identity);
      } else {
        outIdentity = this.identityStringifyNoKey(identity);
      }
    } else {
      outIdentity = this.identityStringifyNoKey(identity);
    }
    let finalPrompt ="";
    if (instruct.order != undefined) {

      finalPrompt += instruct.bos;
      instruct.order.forEach(segment => {
        if (segment == "system") {
          finalPrompt += 
            instruct.startTurn +
            instruct.startSystem +
            instruct.systemRole +
            instruct.endSystemRole +
            instruct.endRole +
            instruct.roleGap +
            instruct.prependPrompt +
            instruct.systemAfterPrepend +
            outIdentity +
            instruct.postPrompt +
            instruct.memorySystem +
            instruct.endSystemTurn +
            instruct.endTurn;
        } else if(segment == "user") {
          finalPrompt += 
            instruct.startTurn +
            instruct.startUser +
            instruct.userRole +
            instruct.endUserRole +
            instruct.endRole +
            instruct.roleGap +
            instruct.memoryUser +
            userQuery +
            instruct.endUserTurn +
            instruct.endTurn;
        }else if(segment == "assistant") {
          userQuery += 
            instruct.startTurn +
            instruct.startAssistant +
            instruct.assistantRole +
            instruct.endAssistantRole +
            instruct.endRole +
            instruct.roleGap +
            instruct.responseStart;
        }
        
      });
      finalPrompt += instruct.eos; //this may belong up top, or responstStart may belong below this. idk, the tokenizer generally handles this.
    } else {
      
      finalPrompt =
        instruct.bos +
        instruct.startTurn +
        instruct.startSystem +
        instruct.systemRole +
        instruct.endSystemRole +
        instruct.endRole +
        instruct.roleGap +
        instruct.prependPrompt +
        instruct.systemAfterPrepend +
        outIdentity +
        instruct.postPrompt +
        instruct.memorySystem +
        instruct.endSystemTurn +
        instruct.endTurn +
        instruct.startTurn +
        instruct.startUser +
        instruct.userRole +
        instruct.endUserRole +
        instruct.endRole +
        instruct.roleGap +
        instruct.memoryUser +
        userQuery +
        instruct.endUserTurn +
        instruct.endTurn +
        instruct.startTurn +
        instruct.startAssistant +
        instruct.assistantRole +
        instruct.endAssistantRole +
        instruct.endRole +
        instruct.roleGap +
        instruct.responseStart+
        instruct.eos;//this might be better up one line, but should generally remain empty
    }
    params.prompt = finalPrompt;
    completion(api, params, this.callback, this.notify, this.handler);
  }

  send(identity, text, params, api) {
    //console.log("send: " + JSON.stringify(api));
    //console.log("params: " + JSON.stringify(params));
    // if (this.lastOutpoint !== api.config) {
    //   this.lastOutpoint = api.config;
      
    // }
    if (api.type === "completion") {
      this.completionMessageBuilder(identity, text, params, api);
    } else if (api.type === "chat") {
      if (api.buildType === "key") {
        this.messageBuilder(identity, text, params, api);
      } else if (api.buildType === "system") {
        this.messageSystemBuilder(identity, text, params, api);
      } else if (api.buildType === "combined") {
        this.messageOneSystemBuilder(identity, text, params, api);
      } else if (api.buildType === "compatible") {
        generateCompletion(
          api,
          identity,
          text,
          this.instructSet,
          params,
          this.callback,
          this.notify,
          this.handler
        );
      } else {
        this.basicMessageBuilder(identity, text, params, api);
      }
    }
  }

  messageBuilder(identity, user, params, api) {
    if (api.model) {
      params.model = api.model;
    }
    let messaged = [];

    for (let key in identity) {
      messaged.push({
        role: key, //I thihnk this is a bad path.
        content: identity[key]
      });
    }
    messaged.push({
      role: "user",
      content: user
    });
    //messaged = JSON.stringify(messaged);
    chat(
      api,
      messaged,
      this.instructSet,
      params,
      this.callback,
      this.notify,
      this.handler
    );
  }
  messageSystemBuilder(identity, message, params, api) {
    if (api.model) {
      params.model = api.model;
    }
    let messages = [];
    for (let key in identity) {
      let ident = identity[key]; //identity[key];
      messages.push({
        role: "system",
        content: JSON.stringify(ident)
      });
    }
    messages.push({
      role: "user",
      content: message
    });
    //messages = JSON.stringify(messages);
    chat(
      api,
      messages,
      this.instructSet,
      params,
      this.callback,
      this.notify,
      this.handler
    );
  }
  messageOneSystemBuilder(identity, message, params, api) {
    if (api.model !== undefined) {
      params.model = api.model;
    }
    //for key in identity
    let outIdentity = ""; //identityStringifyNoKey(identity);
    if (api.jsonSystem != undefined) {
      if (api.jsonSystem === "full") {
        outIdentity = JSON.stringify(identity);
      } else if (api.jsonSystem === "keys") {
        outIdentity = this.identityStringifier(identity);
      } else if (api.jsonSystem === "markup") {
        outIdentity = this.systemPromptBuilder(identity);
      } else if (api.jsonSystem === "none") {
        outIdentity = this.identityStringifyNoKey(identity);
      } else {
        outIdentity = this.identityStringifyNoKey(identity);
      }
    } else {
      outIdentity = this.identityStringifyNoKey(identity);
    }
    let messages = [];
    messages.push({
      role: "system",
      content: outIdentity
    });
    messages.push({
      role: "user",
      content: message
    });
    //messages = JSON.stringify(messages);
    chat(
      api,
      messages,
      this.instructSet,
      params,
      this.callback,
      this.notify,
      this.handler
    );
  }
  basicMessageBuilder(identity, message, params, api) {
    if (api.model !== undefined) {
      params.model = api.model;
    }
    let messages = [
      { role: "system", content: JSON.stringify(identity) },
      { role: "user", content: message }
    ];
    //messages = JSON.stringify(messages);
    chat(
      api,
      messages,
      this.instructSet,
      params,
      this.callback,
      this.notify,
      this.handler
    );
  }
  systemPromptBuilder(identity) {
    let secretIdentity = "";
    for (const key in identity) {
      secretIdentity +=
        this.instructSet.endTurn +
        this.instructSet.endUserTurn +
        this.instructSet.startTurn +
        this.instructSet.startUser +
        key +
        this.instructSet.endUserRole +
        this.instructSet.endRole +
        identity[key] +
        this.instructSet.roleGap;
    } //this.instructSet.endTurn + this.inferenceClient.instructSet["end"+typeStepBack[type]+"Turn"] + this.inferenceClient.instructSet.startTurn + this.inferenceClient.instructSet["start"+type ] + name + this.inferenceClient.instructSet["end"+type+"Role"] + this.inferenceClient.instructSet.endRole;

    return secretIdentity;
  }
  identityStringifier(identity) {
    let secretIdentity = "";
    for (const key in identity) {
      secretIdentity +=
        " " + key + " : " + identity[key] + this.instructSet.roleGap;
    }
    return secretIdentity;
  }
  identityStringifyNoKey(identity) {
    let secretIdentity = "";
    for (const key in identity) {
      secretIdentity += identity[key] + this.instructSet.roleGap;
    }
    return secretIdentity;
  }
}
async function chat(
  api,
  messages,
  promptFormat,
  params,
  callback,
  notify,
  handler
) {
  try {
    if (api.noFormat == undefined || api.noFormat == false) {
      if (api.templateStringKey != undefined && api.templateStringKey != "") {
        params[api.templateStringKey] = JinjaFormatter(promptFormat);
      }
      if (api.koboldAdapter != undefined && api.koboldAdapter != false) {
        params.koboldAdapter = returnKoboldAdapter(promptFormat);
      }
    }
    console.log("sending to completion api: " + api.url);

    //messages = JSON.stringify(messages)
    //console.log("messages: " + messages);
    params.messages = messages;
    const config = {
      method: "POST",
      url: api.url,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${api.key}`
      },
      data: params
    };
    //const outprompt = JSON.stringify({...params,...prompt})
    //const outprompt = {...params,...prompt}
    //console.log("outprompt: "+ outprompt);
    handler
      .request(config)
      .then(response => {
        if (!response.ok === "OK") {
          //notify("api error: ", response.statusText);
          console.log("completion api error: " + response.statusText);
        }
        //console.log(response.data);
        const output = outPointer(api.outpoint, response.data); // response.json();
        callback(output);
      })
      .catch(error => {
        console.log(error);
        //parse the error message
        const message = error.response.data;
        console.log(message);
      });
  } catch (error) {
    console.log(error);
  }
}
async function completion(api, params, callback, notify, handler) {
  try {
    console.log("sending to completion api: " + api.url);
    const response = await handler
      .request(api.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${api.key}`
        },
        data: JSON.stringify(params)
      })
      .then(response => {
        if (!response.ok === "OK") {
          console.log("completion api error: " + response.statusText);
        }
        //console.log(response.data);
        const output = outPointer(api.outpoint, response.data);
        callback(output);
      })
      .catch(error => {
        console.log(error);
      });
  } catch (error) {
    console.error("Error in completion API:", error);
  }
}
function outPointer(outpoint, data) {
  try {
    switch (outpoint.outpointPathSteps) {
      case 1:
        console.log(data[outpoint.one]);
        return data[outpoint.one];
      case 2:
        return data[outpoint.one][outpoint.two];
      case 3:
        return data[outpoint.one][outpoint.two][outpoint.three];
      case 4:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four];
      case 5:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ];
      case 6:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ][outpoint.six];
      case 7:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ][outpoint.six][outpoint.seven];
      case 8:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ][outpoint.six][outpoint.seven][outpoint.eight];
      case 9:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ][outpoint.six][outpoint.seven][outpoint.eight][outpoint.nine];
      case 10:
        return data[outpoint.one][outpoint.two][outpoint.three][outpoint.four][
          outpoint.five
        ][outpoint.six][outpoint.seven][outpoint.eight][outpoint.nine][
          outpoint.ten
        ];
      case 11:
        throw new Error({
          message:
            "Bro, really? you buried your simple response target this deep in a response object? Is this your security through obscurity layer?"
        });
      default:
        console.log(
          "Expected a number between 1 and 10, but got: " +
            outpoint.outpointPathSteps
        );
        break;
    }
  } catch (error) {
    console.log(
      "Expected " +
        outpoint.outpointPathSteps +
        "{ outpointPathSteps: 3, one : 'variable', two..., but got: " +
        JSON.stringify(outpoint) +
        "\n error: " +
        error
    );
  }
}
function JinjaFormatter(instructionSet) {
  return (
    `|-
  {%- set ns = namespace(found=false) -%}
   {%- for message in messages -%}
       {%- if message['role'] == 'system' -%}
           {%- set ns.found = true -%}
       {%- endif -%}
   {%- endfor -%}
   {%- for message in messages %}
      {%- if message['role'] == 'system' -%}
        {{- '` +
    instructionSet.bos +
    instructionSet.startTurn +
    instructionSet.startSystem +
    instructionSet.systemRole +
    instructionSet.endRole +
    instructionSet.endSystemRole +
    instructionSet.roleGap +
    instructionSet.prependPrompt +
    instructionSet.systemAfterPrepend +
    `' + message['content'] + '` +
    instructionSet.postPrompt +
    instructionSet.memorySystem +
    instructionSet.endSystemTurn +
    instructionSet.endTurn +
    `' -}}
      {%- else -%}
      {%- if message['role'] == 'user' -%}
        {{-'` +
    instructionSet.startTurn +
    instructionSet.startUser +
    instructionSet.userRole +
    instructionSet.endUserRole +
    instructionSet.endRole +
    instructionSet.roleGap +
    instructionSet.memoryUser +
    `' + message['content']` +
    instructionSet.specialInstructions +
    ` + '` +
    instructionSet.endUserTurn +
    instructionSet.endTurn +
    `'-}}
      {%- else -%}
        {{-'` +
    instructionSet.startTurn +
    instructionSet.startAssistant +
    instructionSet.assistantRole +
    instructionSet.endAssistantRole +
    instructionSet.endRole +
    instructionSet.roleGap +
    `' + message['content'] + '` +// instructionSet.responseStart+ //maybe here... nope, it isn't sending correctly.
    instructionSet.endAssistantTurn +
    instructionSet.endTurn +
    `' -}}
        {%- endif -%}
      {%- endif -%}
    {%- endfor -%}
  {%- if add_generation_prompt -%}
  {{-'${ 
    instructionSet.startTurn +
    instructionSet.startAssistant +
    instructionSet.assistantRole +
    instructionSet.endAssistantRole +
    instructionSet.endRole +
    instructionSet.roleGap +
    instructionSet.responseStart 
  }'-}}
  {%- endif -%}
  `
  );
}
// instruction_template: |-
//   {%- set ns = namespace(found=false) -%}
//   {%- for message in messages -%}
//       {%- if message['role'] == 'system' -%}
//           {%- set ns.found = true -%}
//       {%- endif -%}
//   {%- endfor -%}
//   {%- for message in messages %}
//       {%- if message['role'] == 'system' -%}
//           {{- '<|im_start|>system\n' + message['content'].rstrip() + '<|im_end|>\n' -}}
//       {%- else -%}
//           {%- if message['role'] == 'user' -%}
//               {{-'<|im_start|>user\n' + message['content'].rstrip() + '<|im_end|>\n'-}}
//           {%- else -%}
//               {{-'<|im_start|>assistant\n' + message['content'] + '<|im_end|>\n' -}}
//           {%- endif -%}
//       {%- endif -%}
//   {%- endfor -%}
//   {%- if add_generation_prompt -%}
//       {{-'<|im_start|>assistant\n'-}}
//   {%- endif -%}
function returnKoboldAdapter(instructionSet) {
  //should be recieved into params.adapter
  const systemStart =
    instructionSet.bos +
    instructionSet.startTurn +
    instructionSet.startSystem +
    instructionSet.systemRole +
    instructionSet.endSystemRole +
    instructionSet.endRole +
    instructionSet.roleGap +
    instructionSet.prependPrompt +
    instructionSet.systemAfterPrepend;
  const systemEnd =
    instructionSet.postPrompt +
    instructionSet.memorySystem +
    instructionSet.endSystemTurn +
    instructionSet.endTurn;
  const userStart =
    instructionSet.startTurn +
    instructionSet.startUser +
    instructionSet.userRole +
    instructionSet.endUserRole +
    instructionSet.memoryUser;
  const userEnd = instructionSet.endUserTurn + instructionSet.endTurn;
  const assistantStart =
    instructionSet.startTurn +
    instructionSet.startAssistant +
    instructionSet.assistantRole +
    instructionSet.endAssistantRole +
    instructionSet.endRole +
    instructionSet.roleGap;
  const assistantEnd =
    instructionSet.endAssistantRole +
    instructionSet.endAssistantTurn +
    instructionSet.endTurn +
    instructionSet.responseStart;
  return {
    system_start: systemStart,
    system_end: systemEnd,
    user_start: userStart,
    user_end: userEnd,
    assistant_start: assistantStart,
    assistant_end: assistantEnd
  };
}
async function generateCompletion(
  api,
  identity,
  text,
  instructions,
  params,
  callback,
  notify,
  handler
) {
  if (api.noFormat == undefined || api.noFormat == false) {
    if (api.templateStringKey != undefined && api.templateStringKey != "") {
      params[api.templateStringKey] = JinjaFormatter(promptFormat);
    }
    if (api.koboldAdapter != undefined && api.koboldAdapter != false) {
      params.koboldAdapter = returnKoboldAdapter(promptFormat);
    }
  }
  try {
    const url = api.url;
    //console.log(apiKey, identity, formattedQuery, params, apiUrl, model);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api.key}`
    };
    const stringifidentity = JSON.stringify(identity);
    const prompt = {
      model: api.model,
      messages: [
        { role: "system", content: stringifidentity }, //does this order matter? do the roles matter in the back end? is that useful for naming the system or tracking multiple characters?
        { role: "user", content: text }
      ],
      stream: false
    };
    const outprompt = { ...params, ...prompt };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(outprompt)
    });
    const jsonResponse = await response.json();
    //console.log("response: "+JSON.stringify(jsonResponse));
    if (!response.ok) {
      console.log(
        `Request failed with status ${response.status}: ${jsonResponse.error
          .message}`
      );
    }
    //console.log("2nd end response: "+JSON.stringify( jsonResponse.choices[0].message.content));
    callback(jsonResponse.choices[0].message.content);
  } catch (error) {
    console.log(error);
    //notify("error:", JSON.stringify(error));
  }
}

module.exports = InferenceClient;
