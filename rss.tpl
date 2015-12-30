<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
    <channel>
        <atom:link href="https://hk1229.cn/demo/phoenixtv/podcast/audio/qqsrx.xml" type="application/rss+xml" rel="self" />
        <copyright>Copyright © ${year} 凤凰卫视</copyright>
        <language>zh-cn</language>
        <link>https://hk1229.cn/demo/phoenixtv/</link>
        <title>${pfind.pname}</title>
        <itunes:keywords>凤凰卫视</itunes:keywords>
        <itunes:author>Kyle He</itunes:author>
        <itunes:subtitle>${pfind.pname}</itunes:subtitle>
        <!-- import: summary -->
        <description>${pfind.info}</description>
        <itunes:image href="${pfind.img}" />
        <itunes:keywords>凤凰卫视 <?php echo $pfind.pname ?> <?php echo $pfind.compere ?></itunes:keywords>
        <itunes:owner>
            <itunes:name>Kyle He</itunes:name>
            <itunes:email>ohyes@hk1229.cn</itunes:email>
        </itunes:owner>

<!-- for: ${items} as ${item} -->
    <!-- use: item(rtle=${item.rtle}, rutime=${item.rutime},
        filepath=${item.filepath}, rdur=${item.rdur}, pid=${item.pid},
        rid=${item.rid}, rnum=${item.rnum}) -->
<!-- /for -->

    </channel>
</rss>

<!-- target: summary) -->
<itunes:summary><![CDATA[
    <p>Feedback 👉
        🌀Weibo: <a href="http://weibo.com/327303000" target="_blank">@_何凯_</a>
        🐦Twitter: <a href="https://twitter.com/kyleehee" target="_blank">@kyleehee</a>
    </p>
]]></itunes:summary>
<!-- /target -->

<!-- target: item -->
<item>
    <title>${rtle}</title>
    <itunes:author>Kyle He</itunes:author>
    <itunes:subtitle>${rutime}</itunes:subtitle>
    <!-- import: summary -->
    <enclosure url="${filepath}" type="audio/mp3" length=""/>
    <guid>${pid}-${rid}</guid>
    <pubDate>${rutime|utc-date}</pubDate>
    <itunes:duration>${rdur}</itunes:duration>
    <itunes:isClosedCaptioned>no</itunes:isClosedCaptioned>
    <link>https://hk1229.cn/demo/phoenixtv/</link>
    <description>${rutime} ${rtle} （播放${rnum}次）</description>
</item>
<!-- /target -->
