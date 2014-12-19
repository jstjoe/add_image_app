(function() {

  return {
    defaultState: 'loading',
    events: {
      'app.created':'created',
      'comment.attachments.changed':'reload',
      // click events
      'click .list_attachments':'load',
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },
    requests: {
      getAccountSettings: function() {
        return {
          url: '/api/v2/account/settings.json'
        };
      }
    },
    created: function() {
      // get account settings and throw error if markdown not enabled
      this.ajax('getAccountSettings').done(function(response) {
        var markdown = response.settings.tickets.markdown_ticket_comments;
        if(!markdown) {
          // show error and exit
          services.notify('<strong>Markdown Disabled</strong> Your account must have Markdown enabled to make use of the Markdown Link app.', 'error');
          // '/agent/admin/tickets'
          this.hide();
          return;
        } else {
          this.switchTo('links');
          this.load();
        }
      });
    },
    load: function() {
      var attachments = this.comment().attachments(),
        files = [];
      _.each(attachments, function(file) {
        var img,
          type = file.contentType(),
          url = file.contentUrl();
        if(_.contains(["image/jpeg","image/gif","image/png","image/tiff","image/svg+xml"], type)) {
          img = true;
        } else {
          img = false;
        }
        if(url) {
          files.push({
            url: file.contentUrl(),
            name: file.filename(),
            thumb: file.thumbnailUrl(),
            image: img
          });
        }
      }.bind(this));
      if(files[0]) { // if there are files attached show the attachments section and hide the button
        this.$('.attachments').show();
        // this.$('.list_attachments').hide();
        var html = this.renderTemplate('attachments', {
          files: files
        });
        this.$('.attachments').html(html);
      } else {
        // this.reload();
        this.$('.attachments').hide();
      }
    },
    reload: function(e) {
      // this.$('.list_attachments').show();
      this.$('.attachments').hide();
      this.interval = setInterval(function() {
        console.log('re-checking attachments');
        var attachments = this.comment().attachments();
        // if they all have URLs clearTimeout and call this.load()
        var urls = _.map(attachments, function(attachment) {
          var url = attachment.contentUrl();
          var bool;
          if(url) {
            bool = true;
          } else {
            bool = false;
          }
          return bool;
        });
        var allLoaded = !_.contains(urls, false);
        var oneLoaded = _.contains(urls, true);
        if(allLoaded) {
          clearInterval(this.interval);
          this.load();
        } else if (oneLoaded) {
          this.load();
        }
        // debugger;
        // clearInterval(this.interval);
      }.bind(this), 100);
    },
    copyLink: function(e) {
      var link = this.getSrc(e),
        markdown = helpers.fmt('[%@](%@)', link.name, link.src);
      this.pasteComment(markdown);
    },
    copyEmbed: function(e) {
      var link = this.getSrc(e),
        markdown = helpers.fmt('![%@](%@)', link.name, link.src);
      this.pasteComment(markdown);
    },
    copyLinkedEmbed: function(e) {
      var link = this.getSrc(e),
        markdown = helpers.fmt('[![%@](%@)](%@)', link.name, link.src, link.src);
      this.pasteComment(markdown);
    },
    pasteComment: function(markdown) {
      var existingComment = this.comment().text();
      if (!existingComment) {
        this.comment().text(markdown);
      } else {
        this.comment().text(existingComment + '\n\n' + markdown);
      }
    },
    getSrc: function(e) {
      var src,
        name;
      if(e.currentTarget.dataset.url) {
        // click was on attachment button
        src = e.currentTarget.dataset.url;
        name = e.currentTarget.dataset.name;
      } else {
        // click was on URL button
        src = this.$('.source').val();
        name = this.$('.text').val();
      }
      return {
        "src":src,
        "name":name
      };
    }
  };

}());
