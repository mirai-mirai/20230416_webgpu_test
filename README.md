# WebGL vs WebGPU

tensorflow.jsの処理速度がバックエンドによってどれくらい異なるか実験する

ハンドポーズ推定処理を用いて測定する

1. webGLの場合
1. webGPUの場合

デモ(https://mirai-mirai.github.io/20230416_webgpu_test/)

## 結果

chrome 113 β版ではhandposeをwebGPUで動作させるとエラーになる
(2023/4/16 22:00時点)

## 今後の作業

chrome 113 正式版は4/23にリリース予定。

それ以後に再度試すか。

あるいは別のモデルで試してみるか。

