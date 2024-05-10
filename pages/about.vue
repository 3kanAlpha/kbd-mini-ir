<template>
  <v-container>
    <div id="about-container">
      <h1 class="my-4">このサイトについて</h1>

      <h2 class="mb-2">IRmania とは？</h2>
      <div class="pl-2 mb-6">
        <p>
          <span class="font-weight-black">IRmania</span>は、様々な音楽ゲームで手軽に大会を開くためのプラットフォームです。<br />
          使用するゲームタイトルと譜面を指定することで誰でも簡単に大会を開くことができ、
          また他のプレイヤーが作成した大会に参加することもできます。
        </p>
      </div>

      <h2 class="mb-2">初めての方へ</h2>
      <div class="pl-2 mb-6">
        <p class="mb-2">
          大会を作成する、または既存の大会へ参加するには<span class="font-weight-bold">アカウントが必要となります</span>。<br />
          サイト上部にあるナビゲーションバーからログインページへ移動し、アカウントを作成してください。
        </p>
        <p>
          <v-icon icon="mdi-account-circle" size="small"></v-icon>を押すことでログインページへ移動できます。<br />
          IRmaniaではDiscordアカウントと連携してアカウントを作成します。ログインをすることで、自動的にアカウントが作成されます。
        </p>
      </div>

      <h2 class="mb-2">大会に参加する</h2>
      <div class="pl-2 mb-6">
        <p class="mb-2">
          現在開催中の大会は、トップページから確認することができます。<br />
          参加したい大会があったら、その名前の部分をクリックすることで各大会の詳細ページへ移動できます。
        </p>
        <p class="mb-4">
          各大会のページでは、現在提出されているスコアのランキングを確認することができます。<br />
          またログイン済みの場合、大会へのスコア提出ができるようになります。「スコア提出」ボタンからフォームにアクセスできるので、フォームに必要な情報を入力して提出してください。
        </p>

        <h3>スコアを提出する際の注意</h3>
        <p class="mb-2">
          アカウントを作成した後、最初はプレイヤー名が未設定となっているため、<NuxtLink to="/account">アカウント設定</NuxtLink>からプレイヤー名を設定してください。<br />
          プレイヤー名が未設定のままスコアを提出をしてしまった場合でも、後からプレイヤー名を設定できます。
        </p>
      </div>

      <h2 class="mb-2">大会を作成する</h2>
      <div class="pl-2 mb-6">
        <p>
          工事中
        </p>
      </div>

      <h2 class="mb-2">クレジット</h2>
      <div class="pl-2 mb-4">
        <p>
          開発 : まぐ <NuxtLink to="https://twitter.com/luigi_0829_2" target="_blank">@luigi_0829_2</NuxtLink>
        </p>
        <p>
          ロゴ : さち <NuxtLink to="https://twitter.com/keepthechain999" target="_blank">@keepthechain999</NuxtLink>
        </p>
      </div>

      <v-divider class="mb-4"></v-divider>
      <div class="pl-4">
        <span style="font-size: 0.8em">IRmaniaはSupabase, Cloudflare R2, Deno Deployを利用して開発されています。</span>
      </div>
    </div>
  </v-container>
</template>

<script setup>
useSeoMeta({
  title: 'このサイトについて',
})
</script>

<style>
#about-container {
  max-width: 700px;
}
</style>