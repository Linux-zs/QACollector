import { initDB } from './db';
import { UserModel } from './models/User';
import { TermModel } from './models/Term';

const terms = [
  // === 行情系统 ===
  { question: '上证FAST文件行情的生产标准接口包含哪些必需的数据文件？', answer: '现货行情必需mktdt00.txt和fjyYYYYMMDD.txt；cpxx0202MMDD.txt和cpxx0201MMDD.txt至少有一个（优先cpxx0202）。此外mktdt01.txt提供科创板盘后定价，mktdt02.txt提供债券实时行情，mktdt03.txt等提供期权行情，mktdt04.txt等提供港股通行情。', category: '行情系统', tags: ['上证', 'FAST', '行情源', '数据文件'] },
  { question: '沪深行情的基本部署架构由哪些组件组成？', answer: '包括一主一备两个转发器（TDXVIM/VIM），以及其下游不超过15台行情转码机（TDXDT/DT），行情主站与转码机同机部署。', category: '行情系统', tags: ['部署架构', 'VIM', '转码机', '行情主站'] },
  { question: '深证第五代行情接口与第四代有什么区别？', answer: '第五代不再使用实时行情文件，而是采用XML文件（用于初始化和收盘）加流式实时行情的方式；第四代使用sjshq.dbf和sjsxxn.dbf等DBF文件。第五代接口支持衍生品（期权）行情。', category: '行情系统', tags: ['深证', '行情接口', '第五代', 'DBF'] },
  { question: 'VIM级联模式有什么限制？', answer: 'VIM可以级联，但级联的下游VIM不包含衍生品数据导出。级联模式可以不用配置深证参考文件目录，因为初始化和收盘信息可从上游VIM获取。', category: '行情系统', tags: ['VIM', '级联', '衍生品'] },
  { question: '北证行情的数据来源是什么？', answer: '北证行情从股转公司发布的行情中抽取，源文件为nqhq.dbf和nqxx.dbf（与深证第四代接口接近），只保留北交所上市公司相关代码。新增网关用于固收品种行情发布，与深证第五代接口接近。', category: '行情系统', tags: ['北证', '北交所', '行情源', '股转'] },
  { question: 'Linux行情系统的虚盘(tmpfs)如何配置？', answer: '在/etc/rc.local中加入：mkdir /tmp/ram/ && mount -t tmpfs tmpfs /tmp/ram/ && chmod -R 777 /tmp/ram && mkdir /tmp/ram/yxhj/ && mkdir /tmp/ram/vipdoc/。网上交易模式必须采用tmpfs方式，ramdisk空间会不够。', category: '行情系统', tags: ['Linux', '虚盘', 'tmpfs', '部署'] },
  { question: '行情主站和转码机的推荐启动时间是什么？', answer: '行情主站建议在8:49关闭、8:52开启；转码机建议在8:50运行。通过crontab控制，转码机初始化时会自动杀掉hostl，初始化完成后自动重启hostl。', category: '行情系统', tags: ['行情主站', '转码机', '启停时间', 'crontab'] },
  { question: 'hostl.ini中最大连接数如何计算？', answer: '最大连接数 = processnum × threadnum。3.0系统processnum最大可设180，threadnum最大可设240，即最大连接数可达43200。', category: '行情系统', tags: ['hostl', '最大连接数', '配置'] },
  { question: '沪深京行情后台的四个核心程序及其端口分别是什么？', answer: 'Hostl（行情主站，端口7709）提供行情接入服务；Tdxdt（转码机，端口8811）将DBF转成通达信格式；Vim（行情发送端，端口9899）读取并转发DBF库；Jktool为监控工具。', category: '行情系统', tags: ['行情主站', '转码机', 'VIM', '端口'] },
  { question: '扩展行情后台的DTF和DTS/Dshost分别是什么？', answer: 'DTF（端口7777）接收交易所行情并转发；DTS/Dshost（端口7721）接收DTF行情并向客户端提供服务，收盘时做收盘操作。', category: '行情系统', tags: ['扩展行情', 'DTF', 'Dshost', '端口'] },
  { question: '扩展行情主站dshost的监听端口默认是什么？', answer: '默认监听端口为listenport=7721，在dshost.ini的[System]段配置。扩展行情主站可长时间无人值守运行，无须关闭服务。', category: '行情系统', tags: ['扩展行情', 'dshost', '端口', '配置'] },
  { question: '信创系统上部署行情系统需要注意哪些与传统系统不同的地方？', answer: '①区分x86和arm架构，使用不同的应用程序包；②有些系统只有/etc/rc.local而非/etc/rc.d/rc.local，需加x权限；③默认可能没有wget和killall命令，需手动安装wget（apt-get install wget）并将killall换成pkill。', category: '行情系统', tags: ['信创', 'Linux', '部署', '架构适配'] },

  // === 交易中心 ===
  { question: 'TC50交易中心的整体架构是怎样的？', answer: '架构为：客户端 → 交易中心(Tdxtc50.exe) → 接口 → 中间件 → 柜台。服务器端程序先启动，客户端再连接。接口dll加载成功后，交易中心在指定端口开始监听。', category: '交易中心', tags: ['TC50', '架构', '交易中心'] },
  { question: '虚拟营业部和实际营业部是什么关系？', answer: '客户端Etrade.xml中配置虚拟营业部，一个虚拟营业部至少对应一个实际营业部。客户端登录时带上虚拟营业部ID，交易中心将其映射为实际营业部后发送给中间件。登录前后营业部可能不同（融资融券除外）。', category: '交易中心', tags: ['TC50', '虚拟营业部', '登录'] },
  { question: 'TC50交易中心默认的通讯参数是什么？', answer: '默认最大连接数1000人，默认侦听端口7708，线程池200。客户端到交易中心有心跳包机制（防止被踢掉连接），接口到中间件有超时机制。', category: '交易中心', tags: ['TC50', '通讯参数', '端口', '线程池'] },
  { question: '交易中心目录中有哪些特别重要的配置文件？', answer: '三个特别重要的文件：trade.ccf（委托配置文件）、sygn.ini（所有功能配置文件）、tdxtc50.ini（交易中心主配置文件）。日志文件在log目录下，每天4个文件一组（.log/.per/.sec/.pml）。', category: '交易中心', tags: ['TC50', '配置文件', 'trade.ccf', 'sygn.ini'] },
  { question: 'V6客户端配置新功能的一般步骤是什么？', answer: '三步：1) 配置客户端tcoem.xml文件；2) 配置交易中心的trade.ccf和sygn.ini；3) 配置接口ini。即：客户端先有功能标签 → 交易中心增加控制开关 → 接口增加开关。', category: '交易中心', tags: ['V6', '配置', '客户端', '交易中心'] },
  { question: '如何生成TC50的license申请文件？', answer: '在TC50面板中，点击【信息】，右键任意位置弹出选项框，选择【生成license申请表格】，选择路径存储生成的req文件。', category: '交易中心', tags: ['TC50', '授权', 'license'] },
  { question: '导入授权key文件的操作步骤是什么？', answer: '总部授权后会返回key文件，不需要重命名，按照对应的MAC地址，在TC50中导入该key文件，按照提示重启TC50即可生效。', category: '交易中心', tags: ['TC50', '授权', 'key文件'] },
  { question: 'TC50压力工具的基本设置中，各项参数应如何配置？', answer: '网关地址和端口填TC50所在IP和端口；线程数一般设100；模拟客户数采取慢慢增加的原则；请求间隔时间一般10s-20s；连接间隔时间可设置较短以达到极限压力；采样间隔时间用于记录测试报告。', category: '交易中心', tags: ['TC50', '压力测试', '配置'] },
  { question: '压力测试应遵循什么原则？', answer: '采用"少压多次、步加压"的原则，找出瓶颈（并发上限）、找出极限（正常工作的最大容量）、找出临界现象（慢、报警、波动），并做好记录。', category: '交易中心', tags: ['压力测试', '原则', 'TC50'] },
  { question: 'TC50监控界面中"每秒请求事务"的X1和Y1分别代表什么？', answer: 'X1是每秒吞吐的交易中心协议事务数（包括业务），Y1是每秒吞吐的业务层协议事务数（仅业务）。Y1是X1的子集，因为不是全部请求都需要送后台。', category: '交易中心', tags: ['TC50', '监控', '性能指标'] },
  { question: '如何通过"队列深度"判断TC50的运行状态？', answer: 'X2低水平Y2低水平=轻负载（性能良好）；X2低水平Y2高水平=高负载但性能良好；X2和Y2保持相近中等水平=吞吐逼近上限；X2高水平Y2低水平=后台处理拥堵，队列堆积。', category: '交易中心', tags: ['TC50', '监控', '队列深度', '性能'] },

  // === 国密安全 ===
  { question: 'HTTPS和HTTP的主要区别是什么？', answer: 'HTTPS是加密传输协议，HTTP是明文传输协议；HTTPS需要SSL证书，标准端口443，基于传输层；HTTP标准端口80，基于应用层。HTTPS具有身份验证、信息加密和完整性校验功能。', category: '国密安全', tags: ['HTTPS', 'HTTP', 'SSL', '加密'] },
  { question: 'TLS/SSL依赖哪三类基本算法？各自的作用是什么？', answer: '1) 非对称加密（如RSA）：实现身份认证和密钥协商；2) 对称加密（如AES-CBC）：采用协商密钥对数据加密；3) 散列函数Hash（如SHA256）：验证信息完整性。', category: '国密安全', tags: ['SSL', 'TLS', '加密算法', 'RSA'] },
  { question: 'SSL握手过程中客户端如何验证服务器证书的合法性？', answer: '客户端验证包括：证书链的可信性（是否由受信任CA签发）、证书是否被吊销（CRL或OCSP）、证书是否在有效期内、证书域名是否与访问域名匹配。', category: '国密安全', tags: ['SSL', '证书验证', '握手', 'CA'] },
  { question: 'HTTPS的会话缓存机制有哪两种？有什么区别？', answer: '1) Session ID：由服务器端保存会话信息，占服务器资源较多；2) Session Ticket：将协商信息加密后发送给客户端保存，占服务器资源少。两者都存在时优先使用Session Ticket。', category: '国密安全', tags: ['HTTPS', '会话缓存', 'Session', '性能优化'] },
  { question: '证书链的二级结构有什么优势？', answer: '1) 减少根证书机构管理工作量；2) 根证书私钥一般离线存储，泄露时吊销困难；3) 中间证书私钥泄露可快速在线吊销并重新签发；4) 证书链四级以内不会对HTTPS性能造成明显影响。', category: '国密安全', tags: ['证书链', 'CA', 'PKI', '安全'] },
  { question: '商用密码体系中使用的国密算法有哪些？', answer: '对称密钥：SM4/AES/DES；非对称密钥：SM2/RSA/DSA；信息摘要：SM3/MD5/SHA256。其中SM2/SM3/SM4为国密算法。', category: '国密安全', tags: ['国密', 'SM2', 'SM3', 'SM4', '加密算法'] },
  { question: 'A向B发送加密签名消息的完整流程是什么？', answer: 'A端：①提取消息摘要h(m)，用A的私钥加密摘要生成签名s；②将签名s和消息m用B的公钥加密生成密文c发送。B端：①用B的私钥解密得到m和s；②用A的公钥解密签名得到H(m)；③计算消息m的摘要h(m)；④比较两个摘要，相同则验证成功。', category: '国密安全', tags: ['加密', '签名', 'SM2', '非对称加密'] },
  { question: '国密网关nginx启动报错"对称密钥没有生成"怎么处理？', answer: '这是因为没有登录操作员或管理员。服务器重启后需要登录一次操作员或管理员账号，使用密码卡管理端工具执行登录操作。', category: '国密安全', tags: ['国密', '网关', 'nginx', '故障排查'] },
  { question: '网关证书链为3级时，nginx.conf需要如何配置？', answer: '需添加ssl_verify_depth 2配置。默认值为1，证书链为3级配2，4级配3。同时配置双向认证：ssl_verify_client on; ssl_client_certificate sm2-ca.crt;', category: '国密安全', tags: ['国密', 'nginx', '证书链', '配置'] },
  { question: '客户端报"虚拟营业部不存在"怎么解决？', answer: '在TC50左上角的服务设置→虚拟营业部设置→添加，输入不存在的虚拟营业部ID并选择全选真实营业部ID；或直接在TC50目录configs/tdxtc50.ini的虚拟营业部列表中添加。', category: '国密安全', tags: ['国密', '虚拟营业部', '故障排查', 'TC50'] },
  { question: '网关报"驱动未安装"错误如何排查？', answer: '执行lsmod | grep swcsm检测密码卡驱动是否安装，使用insmod swcsm36.ko安装驱动，用dmesg -T | grep sw查看驱动状态。卸载用rmmod swcsm36.ko。', category: '国密安全', tags: ['国密', '密码卡', '驱动', '故障排查'] },
  { question: '/etc/security/limits.conf配置不生效怎么办？', answer: '①检查/etc/security/limits.d/目录下是否有更高优先级的配置覆盖；②修改/etc/systemd/system.conf添加DefaultLimitNOFILE=100000和DefaultLimitNPROC=100000，然后执行systemctl daemon-reexec使其生效。', category: '国密安全', tags: ['Linux', '系统配置', 'limits', '故障排查'] },
  { question: 'SSL网关异常时的应急处理流程是什么？', answer: 'SSL网关异常时，客户端自动处理异常降级，降级直连到旁路tc50交易中心。RA/CA系统异常时同样自动降级。密管机异常时，双活KMS自适应均衡至可用KMS，所有KMS异常则降级处理。', category: '国密安全', tags: ['SSL', '网关', '应急', '降级'] },
  { question: '国密网关的日常运维需要定期检查哪些内容？', answer: '①每月检查磁盘使用（df -h）；②检查定时重启任务（crontab -l）；③查看日志是否正常生成；④检查证书有效期（openssl x509命令）；⑤检查网关运行状态（ps -ef | grep nginx）；⑥检查RA_TS服务状态；⑦检查密管机服务状态。', category: '国密安全', tags: ['国密', '运维', '网关', '日常检查'] },
  { question: '网关nginx.conf中有哪些关键配置项？', answer: '包括：授权文件授权数、TS公钥（逗号隔开）、正式版/测试版标识、客户端IP地址/端口/来源/通道模式、网关连接超时时间、密管机连接、通道标识信息、券商授权标识、降级模式、支持IPV6、http保活等。', category: '国密安全', tags: ['国密', 'nginx', '配置', '网关'] },
  { question: '密码卡操作时需要登录几个ukey？', answer: '执行密钥相关操作（如生成密钥）需要登录三个管理员ukey，其余日常情况只需登录操作员ukey。', category: '国密安全', tags: ['密码卡', 'ukey', '密钥管理'] },
  { question: 'PIN码的完整规则是什么？', answer: '最低6位，输入6-12位数字或字母，不允许特殊字符。不可重复4位以上（如1111、aaaa），不可连续4位以上（如1234、abcd），不可间隔连续4位以上（如1357、aceg）。', category: '国密安全', tags: ['PIN码', '安全规则', '国密'] },
  { question: '网关当前连接数与tc50连接数相差过大怎么处理？', answer: '可能有恶意连接，通过限制网关参数有效阻止：ssl_handshake_timeout 5s（限制SSL握手时间）、client_header_timeout 5s和client_body_timeout 5s（限制请求头和请求体超时）。', category: '国密安全', tags: ['国密', '网关', '连接数', '安全'] },
  { question: '客户端自动降级的触发条件和配置是什么？', answer: '取决于NoCrePopCA配置：设为"1"时，无证书用户使用PIN码登录过程中若CA申请失败则自动降级到网关降级列表或etrade.xmb配置的TC50。降级顺序为：网关降级列表service_list→etrade.xmb配置的TC50。', category: '国密安全', tags: ['国密', '降级', '客户端', 'CA'] },
  { question: '密码错误为什么会导致降级？', answer: '因为CA网络连接故障与交易密码错误的错误码均为-1，未被区分。需在ca.xml中将密码错误的错误码改为-42以与降级场景区分。', category: '国密安全', tags: ['国密', '降级', '密码错误', 'bug'] },
  { question: '证书更换的两种方式分别适用于什么场景？', answer: '方式一：可停服时，直接删除过期密钥对后重新生成并导入；方式二：无法停服时，在非1号位（如2号位）索引位置重新生成密钥，同时修改nginx.conf中所有密钥位置配置。', category: '国密安全', tags: ['证书', '密钥更换', '网关', '运维'] },
  { question: '更换证书和密钥后需要做什么清理操作？', answer: '需要删除网关服务器tdx_ng/tl目录下所有.tl文件（密钥缓存数据），该目录文件拥有者应为nobody，然后重启网关重新缓存密钥。', category: '国密安全', tags: ['证书', '密钥', '清理', '运维'] },
  { question: '密钥导入命令中"0#131328#1"和"0#132096#1"分别代表什么？', answer: '"0#131328#1"代表第0块密码卡的签名密钥第1号位置；"0#132096#1"代表第0块密码卡的加密密钥第1号位置。并行更换时需改为对应的2号位。', category: '国密安全', tags: ['密钥', '密码卡', '导入命令'] },
  { question: '密码卡备份密钥需要几个管理员key？', answer: '需要3个管理员key，依次插入并输入PIN口令输出备份密钥分量（1）（2）（3），备份文件默认保存在/tmp/swcsmbak.dat。', category: '国密安全', tags: ['密码卡', '密钥备份', '管理员key'] },
  { question: '密管机的初始登录凭据是什么？', answer: '后台系统登录：用户sansec，密码SWXA1234@DAR，登录后切root密码SWXAseckms@2019.hdlm。Web管理端(8443端口)：用户admin，密码Swxasyt1306。管理员key默认PIN码为12345678。', category: '国密安全', tags: ['密管机', 'KMS', '登录凭据', '初始配置'] },
  { question: '密管机如何设置IP地址？', answer: '连接显示器键盘后，登录sansec后台（SWXA1234@DAR），切root（SWXAseckms@2019.hdlm），修改IP后执行systemctl restart network重启网卡生效。网线需接到LAN1接口。', category: '国密安全', tags: ['密管机', 'IP配置', '网络'] },
  { question: 'KMS升级的完整步骤是什么？', answer: '①用操作员账号登录并做密管机备份；②删除现有密钥服务；③上传升级包执行（约10分钟）；④关机重启主机；⑤设置缺省服务密码（32位：8个1+8个2+8个3+8个4）；⑥在密钥管理中创建10000端口TCP服务；⑦创建备份。', category: '国密安全', tags: ['密管机', 'KMS', '升级', '运维'] },
  { question: '适配2.18.xx版本密管机需要做哪些操作？', answer: '使用最新的libswkmsapi与网关程序，券商提供密管机业务用户的账号和密码，使用密管机encpasswd秘钥生成工具生成IV、partkey、passwd，将这三个值配置到nginx.conf中，最终生成网关访问密管机的证书。', category: '国密安全', tags: ['密管机', '适配', 'nginx', '配置'] },
  { question: '国密网关的密钥存储目录权限有什么要求？', answer: '/tdx_ng/tl目录的所有者需设置为nobody：chown -R nobody:nobody tl。权限不正确会导致密钥同步错误。', category: '国密安全', tags: ['国密', '目录权限', '密钥存储'] },
  { question: '客户端etrade.xmb中ssl="3"和ssl="2"分别代表什么？', answer: 'ssl="3"代表国密GMSSL模式，ssl="2"代表TC模式。站点配置中的HostType中，0为普通，1为信用。', category: '国密安全', tags: ['客户端', 'SSL', '配置', '国密'] },
  { question: '安全码登录的基本流程是什么？', answer: '客户端检查本地是否有证书：无证书则弹出申请界面；有证书且未到期则校验交易账号+交易密码+安全码；有效期≤15天提示续期；已过期则引导重新申请。', category: '国密安全', tags: ['安全码', '登录', '证书', '认证'] },
  { question: '安全码（PIN码）的复杂度要求是什么？', answer: '不能设置相同数字（如1111）、顺序数字（如1234）等简单密码；数字、大写字母、小写字母三选二。', category: '国密安全', tags: ['安全码', 'PIN码', '密码规则'] },
  { question: '证书与设备的关系是什么？', answer: '证书（安全码）与客户端设备硬件特征码绑定，更换设备需重新申请证书。证书存放在客户端系统目录，客户端升级或重装不需要重新申请。', category: '国密安全', tags: ['证书', '设备绑定', '安全码'] },
  { question: '用户本地有旧证书但登录页自动勾选默认PIN码导致报错怎么办？', answer: '2022年11月中旬之前的旧客户端tdxcsp模块不支持记录证书PIN码类型标识，导致显示为"无标识"而自动勾选默认PIN码。用户可根据提示重新申请证书或手动输入PIN码重试。', category: '国密安全', tags: ['PIN码', '旧证书', '故障排查'] },

  // === 交易业务 ===
  { question: '国内主要的证券交易所有哪些？交易时间是什么？', answer: '主要有：深圳证券交易所（1990年12月1日成立）、上海证券交易所（1990年12月18日成立）、北京证券交易所（2021年9月3日成立）。股票/基金/债券买卖时间一般为9:15-9:25集合竞价、9:30-11:30和13:00-15:00连续竞价。', category: '交易业务', tags: ['交易所', '交易时间', 'A股'] },
  { question: '沪深A股的证券代码段是如何划分的？', answer: '沪市A股：60****（主板）、68****（科创板）；深市A股：00****（主板）、30****（创业板）；北交所：43****、83****、87****。一个交易所内代码唯一，但不同交易所之间可能重码（如160211在上海是地方债，在深圳是LOF基金）。', category: '交易业务', tags: ['证券代码', 'A股', '代码段'] },
  { question: '开通科创板交易权限需要满足什么条件？', answer: '需满足：2年以上股票交易经验、20个交易日日均资产大于50万元人民币，可以网签方式开通。信用账户需另开科创板权限。', category: '交易业务', tags: ['科创板', '开户条件', '交易权限'] },
  { question: '交易委托中的"价格笼子"是什么？', answer: '价格笼子机制是挂单申报的有效申报价格范围。沪深京交易市场在连续竞价阶段使用限价委托时，委托价格需在价格笼子范围内，超出范围的委托将被拒绝。', category: '交易业务', tags: ['价格笼子', '委托', '交易规则'] },
  { question: '股息税的征收标准与持股期限有什么关系？', answer: '持股1个月以内（含1个月）按20%税率征收；持股1个月以上至1年（含1年）按10%征收；持股超过1年免征个人所得税。', category: '交易业务', tags: ['股息税', '持股期限', '税收'] },
  { question: '融资融券客户端配置需要哪些关键文件？', answer: '主要需要：Trade.ccf（交易中心配置，注册WTGN_29到WTGN_43功能号）、sygn.ini（功能总数和功能列表）、tcoem.xml（功能ID注册和菜单结构）、etrade.xml（虚拟营业部配置）、AddinCredit.dll（融资融券模块）。', category: '交易业务', tags: ['融资融券', '配置', '客户端'] },
  { question: '融资融券的维持担保比率警戒线是多少？', answer: '维持担保比率高于300%时可提取现金或证券；低于130%时券商必须要求追加保证金或偿还部分负债；若几个交易日内仍低于下限，券商将执行强制平仓。', category: '交易业务', tags: ['融资融券', '维持担保比率', '风控'] },
  { question: '融券卖出有哪些限制？', answer: '融券卖出价不得低于最近成交价（只能挂卖单不能主动卖出）；卖出资金被锁定，只能用于买回原融券股票还券；融券期限不超过6个月。', category: '交易业务', tags: ['融券', '卖出限制', '交易规则'] },
  { question: '融资融券保证金比率的下限是多少？', answer: '融资和融券的保证金比率下限均为50%，即一定数额保证金所能借贷的最大现金或股票市值。', category: '交易业务', tags: ['融资融券', '保证金', '比率'] },
  { question: '基础设施公募REITs与普通公募基金有什么区别？', answer: 'REITs以基础设施项目为底层资产（非股票债券分散配置），收益来源于底层资产经营收益和增值收益，设有强制分红比例（不低于年度可供分配金额的90%），采用封闭式运作不开通申购赎回。', category: '交易业务', tags: ['REITs', '公募基金', '基础设施'] },
  { question: 'REITs交易的涨跌幅限制是多少？', answer: '上市首日涨跌幅限制比例为30%，非上市首日涨跌幅限制比例为10%。竞价交易的有效竞价范围与涨跌幅限制范围一致。', category: '交易业务', tags: ['REITs', '涨跌幅', '交易规则'] },

  // === 客户端配置 ===
  { question: 'Etrade.xml中AccountType=8代表什么登录方式？', answer: 'AccountType=8代表"深沪合一（资金帐号）"登录方式。其他常见类型：0=深圳A股、1=上海A股、2=深圳B股、3=上海B股、9=客户号委托等。', category: '客户端配置', tags: ['Etrade.xml', '登录方式', 'AccountType'] },
  { question: 'V6客户端支持哪些安全登录方式？', answer: 'SecurityType取值：0=简易方式（通达信SSL）、1=认证口令、2=数字证书、3=OTP验证（口令卡/矩阵卡）、4=UKEY验证（三方硬证书）、5=短信验证。', category: '客户端配置', tags: ['V6', '安全登录', 'SecurityType'] },
  { question: 'Tcoem.xml中Network标签下的关键连接参数有哪些？', answer: '关键参数包括：ConnectTimeout（连接超时）、DisconnectOnIdle（闲置断开）、DisconnIdleTime（闲置时间/秒）、ReconnOnTimer（定时重连）、ReconnSpan（重连间隔/秒）、Nodelay（TCP NoDelay开关）。', category: '客户端配置', tags: ['Tcoem.xml', '网络配置', '连接参数'] },
  { question: 'Trade.ccf中[WTFUNC]节的作用是什么？举例说明。', answer: '[WTFUNC]节控制业务功能菜单项的显示或内部功能调用。例如：ETFKSC=1表示开启ETF跨市场申购赎回，GPCP=1表示开启股票测评，DZHYEX=1表示开启电子合同签约。', category: '客户端配置', tags: ['Trade.ccf', '功能配置', 'WTFUNC'] },
  { question: 'V6客户端快捷交易有哪几种模式？', answer: '有四种模式：NORMAL（标准）、FAST（快速）、FASTEST（极速）、CUSTOM（自定义）。主要区别在于：是否校验密码、是否需要委托确认、双击撤单是否需要确认等。', category: '客户端配置', tags: ['V6', '快捷交易', '交易模式'] },
  { question: '客户端connect.cfg中如何开启交易日志？', answer: '在connect.cfg的[TC]段配置log=1，日志将输出到T0002\\wt_cache目录。', category: '客户端配置', tags: ['日志', 'connect.cfg', '调试'] },
  { question: '通达信信创改造的核心目标是什么？', answer: '将原Windows平台的证券信息系统全面原生移植到Linux平台，兼容适配国产芯片（海光、鲲鹏、飞腾、兆芯）、国产操作系统（银河麒麟V10、统信UOS V20），实现自主可控。', category: '客户端配置', tags: ['信创', 'Linux', '国产化'] },
  { question: '信创交易主站的性能要求是什么？', answer: '单个交易主站支持1万并发用户，每秒平均事务处理能力大于1000笔/秒，每笔事务处理响应时间少于3秒。', category: '客户端配置', tags: ['信创', '性能要求', '交易主站'] },
  { question: '信创TC50出现故障时如何保障业务连续性？', answer: '信创和非信创TC交易中心均兼容Windows客户端，信创TC50出现宕机时可直接停机切换至非信创TC50，实现双轨运行保障。', category: '客户端配置', tags: ['信创', 'TC50', '高可用', '故障切换'] },
  { question: '信创改造的技术栈有哪些主要变化？', answer: '通讯库从IOCP改为epoll+线程池；安全库改为Openssl+国密改造库；基础框架从MFC改为STL+自研库；编译环境改为GCC+CMake+GDB；消息队列从MSMQ改为Kafka等。', category: '客户端配置', tags: ['信创', '技术栈', '架构改造'] },

  // === 部署运维 ===
  { question: '沪深行情系统需要创建哪四个核心目录？', answer: '/tdx/data/（数据目录）、/tdx/tdxvim/（VIM程序目录）、/tdx/tdxdt/（转码机目录）、/tdx/hostl/（行情主站目录）。', category: '部署运维', tags: ['目录结构', '行情系统', '部署'] },
  { question: 'market.ini中各市场的配置包含哪些关键字段？', answer: '关键字段包括：TDXMARKETIDX（市场ID，不可重复）、MARKETNAME（市场简称）、CHINESEMARKETNAME（市场中文名）、MARKETABB（市场标识码）、TDXBIGMARKETTYPE（大类类型）、MARKETDOCNUM（小数精度）、MARKETDELAY（延时分钟数）、MARKETIMEZERO（时区）。', category: '部署运维', tags: ['market.ini', '扩展行情', '配置'] },
  { question: '网页资讯系统的MySQL数据库如何初始化？', answer: '先创建数据库：create database tdx_webzx default character set utf8，然后在该数据库中执行tdxdb.sql文件：use tdx_webzx; SOURCE /tdx/tdx_webzx.sql;', category: '部署运维', tags: ['MySQL', '网页资讯', '数据库', '初始化'] },
  { question: 'TS和TP的SERVID配置有什么注意事项？', answer: 'TS和TP的SERVID不能相同。示例：TS配置SERVID=998，TP配置SERVID=999，均在各自的configs/myserver.ini中设置。', category: '部署运维', tags: ['TS', 'TP', 'SERVID', '配置'] },
  { question: 'UTS数据同步工具的默认管理员账号密码是什么？', answer: '默认管理员账号密码为admin/888666，登录后应立即修改。通过浏览器访问http://ip:端口/admin/index.html进行web管理。', category: '部署运维', tags: ['UTS', '默认密码', '数据同步'] },
  { question: 'x86和arm架构的Java环境包有什么区别？', answer: 'x86架构上传shared_x86.zip，arm架构上传shared_arm.zip，均解压到TS根目录下。解压前需先区分系统架构类型。', category: '部署运维', tags: ['信创', 'x86', 'arm', 'Java'] },
  { question: '周末测试后如何恢复行情数据？', answer: '退出转码机和主站，将备份的正确yxhj数据恢复到yxhj目录（虚盘也要恢复），删除/dev/shm/szihq_g2.sha1和/dev/shm/shihq_g2.sha1共享内存文件（三代行情不需要），再重启转码机和主站。', category: '部署运维', tags: ['行情数据', '恢复', '运维'] },
  { question: '周末或节假日为什么不能打开VIM？', answer: '防止交易所进行测试时将测试数据发送到转码机和主站系统，造成数据污染。', category: '部署运维', tags: ['VIM', '运维', '注意事项'] },
  { question: '各扩展市场的DTF建议启停时间是什么？', answer: '实时港股1:40-18:00，延时港股6:30-18:00，期货20:32-次日18:00，股转8:45-18:00，美股12:30-次日11:30等。', category: '部署运维', tags: ['扩展行情', 'DTF', '启停时间'] },

  // === 网络通讯 ===
  { question: '客户端查找最快服务器的算法核心逻辑是什么？', answer: '客户端多线程同时连接所有服务器发送状态请求，从最先返回的连接中找综合值最低的服务器。综合值=网络延时权重+服务器并发量权重，当并发量超过90%时加大并发量比重。', category: '网络通讯', tags: ['负载均衡', '服务器选择', '客户端'] },
  { question: '如果自动选择的主站不是最优，用户该怎么处理？', answer: '可使用系统菜单中的"主站测速"功能手动找出最优主站，或在通讯设置中关闭"登录时查找最快的主站"，人工选择各类主站。', category: '网络通讯', tags: ['主站测速', '服务器选择', '客户端'] },
  { question: '权重weight设置的作用是什么？', answer: '设置权重后，权重值高的服务器优先连接。综合值公式中会乘以(100-weight)/100进行调整。', category: '网络通讯', tags: ['权重', '负载均衡', '服务器'] },
  { question: '行情TP中主站类型Type值分别代表什么？', answer: 'Type=0为免费沪深AB主站，Type=1为延时扩展，Type=3为实时扩展，Type=8为L2沪深AB主站。', category: '网络通讯', tags: ['TP', '主站类型', '行情'] },
  { question: '收市后APP行情数据仍在跳动怎么解决？', answer: '原因是TP配置了多个行情主站且默认均衡模式，主站间数据差异导致跳动。解决办法是将TP连行情主站改为主备模式，通过group配置指定优先级。', category: '网络通讯', tags: ['TP', '行情', '主备模式', '故障排查'] },
  { question: '行情TP如何开启高速行情推送？', answer: '在tdx.ini的MODULES中添加SERVICES=svc.fasthq，Services.xml中添加FastHQ路由指向本地，并配置<FastHQ>段指定推送源地址和端口（默认30600）。TP需与ab股主站同局域网部署。', category: '网络通讯', tags: ['TP', '高速行情', '推送', '配置'] },
  { question: '如何配置禁用境外IP访问TP行情？', answer: '将IPService.mm和ip2region.db放到TP的proccalls目录，Services.xml中添加Inet配置RedirectRight="NO" HSRedirectRangeRight="YES"，并添加相关路由和别名映射。', category: '网络通讯', tags: ['TP', 'IP限制', '安全', '境外IP'] },
  { question: '键盘记录搜不到码表（APP能看到行情）怎么排查？', answer: '检查TP目录下是否有MobilePortal.dll，tdx.ini中是否加载了该DLL；检查码表服务是否开启及是否配置了正确的行情主站；检查CmnServices.dll和CmnHandlers.dll版本是否较新。', category: '网络通讯', tags: ['TP', '码表', '故障排查'] },

  // === 日志与调试 ===
  { question: 'Android端如何通过工程页面开启taapi日志？', answer: '在行情搜索输入0278778668进入工程页面，点击顶部LOG设置按钮，打开LOG控制开关，返回后重启APP生效。日志位于文件管理—内存—Android—"APP包名"—Log目录。', category: '客户端配置', tags: ['Android', '日志', 'taapi', '调试'] },
  { question: 'iOS端如何获取闪退日志？', answer: '通过手机工具箱中的"崩溃日志"功能获取。通达信iOS端崩溃日志以"tdxApp"开头，以崩溃时间结尾的.ips文件。', category: '客户端配置', tags: ['iOS', '闪退', '日志', '调试'] },
  { question: 'PC客户端如何开启日志记录？', answer: '在程序安装目录找到connect.cfg文件，Ctrl+F查找[TPSYS]字符串，在下面一行添加HasLog=4，重启客户端后打包安装目录下的T0002/log目录。', category: '客户端配置', tags: ['PC', '日志', 'connect.cfg', '调试'] },
];

async function seed() {
  await initDB();

  // Ensure admin user exists
  let admin;
  try {
    admin = UserModel.findByUsername('admin');
    if (!admin) {
      admin = UserModel.create('admin', 'admin123', 'admin');
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }
  } catch (e) {
    admin = UserModel.create('admin', 'admin123', 'admin');
    console.log('Created admin user');
  }

  const adminId = admin!.id;
  let count = 0;

  for (const t of terms) {
    TermModel.create(t.question, t.answer, t.category, t.tags, adminId);
    count++;
  }

  console.log(`Seeded ${count} terms from raw documents`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
