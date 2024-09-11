# git基础

cd命令  --前往对应文件夹

->git init                 #初始化本地仓库

->git add .                #添加工作文件到暂存区

->git commit -m “”        #提交文件到本地仓库

->git remote add origin url  #接入远程仓库

->git branch -M main       #创建分支

->git push -u origin main    #推送文件到某某分支

附

  非快进式推送通常发生在远程分支有新的提交，而你本地的分支没有及时更新导致的冲突。

法1 

  先将远程仓库的更改拉取（pull）到本地，合并到你的分支中，确认合并无误后，再次推送到远程仓库。

法2

  如果你确定要覆盖远程分支的历史，可以使用强制推送（force push），但这通常不推荐，除非你完全确定这是你想要的操作。—force

**命令行基本操作**

git config —list

git config —global user.name

git status

git version

git clone

git log

HEAD  指标

git checkout <编号> 回看版本内容

git checkout master 返回最新版本

git clean -n       新增档案

git clean -f

git checkout —<filename>   加入追踪

git reset HEAD      加入索引

GitHub pages 功能对public项目免费

推送其实是一种合并的动作，两个仓库对应分支比对后将commit 同步过去

![image-20240911210719451](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240911210719451.png)

分支管理  <时空>

git branch <分支>

Branch 就像是便利贴，他会贴在commit位置上

git checkout <分支>  <HEAD>前往对应分支

分支快转

git merge <分支>

不快转的情况  为了工程师知道开发过程当中哪个时间点进行了分支合并

git merge <分支> —no—ff  创建产生一个新的commit

多分支开发需求

master  预设分支

develop 开发分支

feature 开发新功能分支

Git游戏演练：learngitbranching.js.org

git reset HEAD^^(后退两个版本)

git checkout <commit编码>  移动HEAD到某某个commit

git revert HEAD  产生c1’

git reset HEAD^ —hard 彻底回退 

git reflog <commit编号> —hard观看详细历史记录

Git 向GitHub发送PR请求流程<Pull Request>

git pull   

git clone <协议>

commit conflict PR冲突

两个commit在合并时，档案里的某一行有重复修改时，就会发生

本地冲突解决

先处理冲突再继续commit

远端冲突解决

pull后再处理冲突后再push

git fetch

GitHub flow  工作流程

[【Git、GitHub 教學  Mac版】]( https://www.bilibili.com/video/BV1LZ4y1g7SN/?share_source=copy_web&vd_source=5407efe47b71c2ab185bb6ae7c6e5d98)