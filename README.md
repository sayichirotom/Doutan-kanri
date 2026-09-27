# 動態管理 Ver.1
1. Supabaseで新規プロジェクトを作成。
2. SQL Editorで schema.sql を実行。
3. 40名分のランダムトークンを作り、membersへ「表示名＋SHA-256ハッシュ」を登録。
4. config.example.js を config.js にコピーし、Supabase URL と Publishable Key を設定。
5. GitHub repositoryへ index.html/style.css/app.js/config.js を置き、Pagesを有効化。
6. 各人のURLを `https://USERNAME.github.io/REPO/?t=ランダムトークン` としQR化。

注意: GitHub Pagesは公開Webサイトなので、氏名・勤務履歴・秘密鍵をrepositoryへ置かない。Service role keyは絶対にブラウザ側へ置かない。Ver.1は補助的な動態把握用途を想定し、正式な勤怠・給与記録への使用は所属組織の規則確認後に行う。
