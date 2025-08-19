## 요구사항
- google analytics 활성화를 위해 <head></head> 태그 사이에 아래 애드센스 코드를 넣어줘야 한다
  - 메인 페이지, 각 article에 다 포함이 되어야 한다

```
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9LNH27K1YS"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-9LNH27K1YS');
</script>
```