@app.route('/conversational-fact-check', methods=['POST'])
def conversational_fact_check():
    import requests
    from dotenv import load_dotenv
    load_dotenv()

    SERPER_API_KEY = os.getenv("SERPER_API_KEY")

    data = request.json
    user_message = data.get('message')
    conversation_history = data.get('conversation_history', [])

    try:
        # ------ 1️⃣ Perform Real-time Search using Serper ------
        search_url = "https://google.serper.dev/search"
        payload = {"q": user_message}
        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }

        search_results = requests.post(search_url, json=payload, headers=headers).json()

        # Extract relevant text summary
        result_snippets = []

        if "organic" in search_results:
            for item in search_results["organic"][:5]:
                snippet = item.get("snippet", "")
                title = item.get("title", "")
                result_snippets.append(f"{title}: {snippet}")

        live_summary = "\n".join(result_snippets) if result_snippets else "No reliable real-time data found."

        # ------ 2️⃣ System Prompt ------
        system_prompt = f"""
You are a real-time AI fact-checker.

Steps:
1. Analyze the user claim.
2. Compare with verified, real-time search evidence (provided below).
3. If evidence strongly supports the claim → mark TRUE.
4. If evidence contradicts → mark FALSE.
5. If evidence is insufficient/conflicting → mark UNVERIFIABLE.

Return results strictly in JSON with these fields:

{{
 "agent_response": "<short conversational reply>",
 "verdict": "TRUE | FALSE | UNVERIFIABLE",
 "confidence_score": "<0-100>",
 "evidence_summary": "<short summary of evidence>"
}}

Be concise and confident.
"""

        # ------ 3️⃣ Build Conversation for Gemini ------
        past_msgs = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation_history])

        final_prompt = f"""
SYSTEM: {system_prompt}

User Claim:
{user_message}

Search Evidence:
{live_summary}

Conversation History:
{past_msgs}

Now respond in the required JSON format.
"""

        # ------ 4️⃣ Get Gemini Output ------
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(final_prompt)

        ai_raw = response.text

        # Clean JSON output if model added extra text
        try:
            import json
            parsed = json.loads(ai_raw)
        except:
            parsed = {"agent_response": ai_raw, "verdict": "UNKNOWN", "confidence_score": "0", "evidence_summary": live_summary}

        # ------ 5️⃣ Return response ------
        return jsonify({
            "response": parsed,
            "search_evidence": live_summary,
            "status": "success"
        })

    except Exception as e:
        return jsonify({
            "response": f"Error: {str(e)}",
            "status": "error"
        }), 500
