```plantuml
@startuml    
    actor webUser
    participant website
    participant server
    participant browser
    participant openAI
    
    webUser --> website: Query
    
    group start session
        website -> server: Start Session
        server -> browser: start session
        server <-- browser: sessionId, iframeUrl
        website <- server: sessionId, iframeUrl
    end
   
    group get starting url
        website --> server: action 
        server --> openAI: Get URL
        server <- openAI: URL
        server -> browser: GOTO url
        website <- server: update text input
    end

    loop until done
        website --> server: action (GET_NEXT_STEP)
        server --> browser: get screenshot
        server <- browser: screenshot
        server --> browser: get innerText
        server <- browser: innerText
        
        server --> openAI: Get actions
        server <- openAI: actions
        website <- server: action payload

        website --> server: action (EXECUTE_STEP)
        server --> browser: action, sessionId
        server <- browser: 200
        website <- server: feedback
        website -> website: if done, break
    end

    group end session
        website --> server: request session closure
        server --> browser: close session 
    end
@enduml