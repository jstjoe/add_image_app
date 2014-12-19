(function() {

  return {
    defaultState: 'links',
    events: {
      'app.created':'load',
      'comment.attachments.changed':'reload',
      // click events
      'click .list_attachments':'load',
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },
    load: function() {
      var attachments = this.comment().attachments(),
        files = [];
      _.each(attachments, function(file) {
        var img,
          type = file.contentType();
        if(_.contains(["image/jpeg","image/gif","image/png","image/tiff","image/svg+xml"], type)) {
          img = true;
        } else {
          img = false;
        }
        files.push({
          url: file.contentUrl(),
          name: file.filename(),
          thumb: file.thumbnailUrl(),
          image: img
        });
      }.bind(this));
      if(files[0]) { // if there are files attached show the attachments section and hide the button
        this.$('.attachments').show();
        this.$('.list_attachments').hide();
        var html = this.renderTemplate('attachments', {
          files: files
        });
        this.$('.attachments').html(html);
      } else {
        this.reload();
      }
    },
    reload: function(e) {
      this.$('.list_attachments').show();
      this.$('.attachments').hide();
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
