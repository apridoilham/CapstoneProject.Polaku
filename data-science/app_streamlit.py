import streamlit as st, pandas as pd, requests, base64, os, re
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Polaku Analytics", layout="wide")
CID, CSEC = os.getenv("FATSECRET_CLIENT_ID"), os.getenv("FATSECRET_CLIENT_SECRET")


@st.cache_data(show_spinner=False)
def get_token():
    if not CID or not CSEC:
        return None
    auth = base64.b64encode(f"{CID}:{CSEC}".encode()).decode()
    try:
        return requests.post(
            "https://oauth.fatsecret.com/connect/token",
            headers={"Authorization": f"Basic {auth}"},
            data={"grant_type": "client_credentials"},
            timeout=10,
        ).json()["access_token"]
    except:
        return None


@st.cache_data(show_spinner=False)
def fetch_food(token, q):
    try:
        res = requests.get(
            "https://platform.fatsecret.com/rest/server.api",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "method": "foods.search",
                "search_expression": q,
                "format": "json",
                "max_results": 15,
                "region": "ID",
            },
            timeout=15,
        ).json()
        foods = res.get("foods", {}).get("food", [])
        if isinstance(foods, dict):
            foods = [foods]
        out = []
        for f in foods:
            desc = f.get("food_description", "")
            cal = re.search(r"(?:Kalori|Calories):\s*([\d,.]+)", desc)
            out.append(
                {
                    "Nama": f["food_name"],
                    "Kalori": float(cal.group(1).replace(",", ".")) if cal else 0,
                }
            )
        return pd.DataFrame(out)
    except:
        return pd.DataFrame()


st.title("🧬 Polaku Data Science Dashboard")
tab1, tab2, tab3 = st.tabs(
    ["📖 Problem & Dictionary", "📊 Dataset Analysis", "🌐 Live FatSecret API"]
)

with tab1:
    st.info(
        "**Masalah:** User kesulitan menyesuaikan menu dengan target kalori, alergi, & preferensi."
    )
    st.table(
        pd.DataFrame(
            {
                "Kolom": [
                    "id",
                    "name",
                    "calories",
                    "proteins",
                    "fat",
                    "carbohydrate",
                    "image",
                ],
                "Keterangan": [
                    "ID Unik",
                    "Nama Menu",
                    "Energi (kcal)",
                    "Protein (g)",
                    "Lemak (g)",
                    "Karbo (g)",
                    "URL Gambar",
                ],
            }
        )
    )

with tab2:
    csv = os.path.join(
        os.path.dirname(__file__), "..", "backend", "ai", "nutrition.csv"
    )
    if os.path.exists(csv):
        df = pd.read_csv(csv)
        st.success(f"✅ Dataset loaded: {len(df)} item")
        c1, c2 = st.columns(2)
        with c1:
            st.pyplot(
                df["calories"]
                .plot(kind="hist", title="Sebaran Kalori", color="purple")
                .figure
            )
        with c2:
            st.pyplot(
                df.plot.scatter(
                    x="proteins", y="fat", alpha=0.5, title="Protein vs Fat"
                ).figure
            )
    else:
        st.error("nutrition.csv tidak ditemukan.")

with tab3:
    tok = get_token()
    if tok:
        q = st.text_input("Cari makanan:", "Ayam Bakar")
        if q:
            df_live = fetch_food(tok, q)
            if not df_live.empty:
                st.dataframe(df_live, use_container_width=True)
                st.bar_chart(df_live.set_index("Nama"))
            else:
                st.warning("Data tidak ditemukan.")
    else:
        st.error("Token FatSecret gagal diambil. Cek .env")
