(function() {
  return {
    defaultState: 'loading',
    events: {
      'app.created':'created',
      'comment.attachments.changed':'reload',
      // click events
      'click .list_attachments':'load', // this could be removed
      'click .clear':'clearComment',
        // text style
      'click .bold':'insertBold',
      'click .italic':'insertItalic',
        // lists
      'click .unordered':'insertUnordered',
      'click .ordered':'insertOrdered',
      'click .nest':'insertNest',
      'click .break':'insertBreak',
        // quotes
      'click .blockQuote':'insertBlockQuote',
      'click .inlineCode':'insertInlineCode',
      'click .codeBlock':'insertCodeBlock',
        // headings
      'click .h1':'insertH1',
      'click .h2':'insertH2',
      'click .h3':'insertH3',
      'click .h4':'insertH4',
      'click .h5':'insertH5',
        // links
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },
    requests: {
      getAccountSettings: function() {
        return { url: '/api/v2/account/settings.json' };
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
          var simpleButtons = this.setting('simple');
          this.switchTo('links', {
            simple: simpleButtons
          }); // send the 'simple' setting
          this.load();
        }
      });
    },
    load: function(incomplete) {
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
      if(attachments[0]) { // if there are files attached show the attachments section
        var html = this.renderTemplate('attachments', {
          files: files,
          incomplete: incomplete
        });
        this.$('.attachments').html(html);
        this.$('.attachments').show();
      } else {
        // otherwise clear the attachments section
        this.$('.attachments').html('');
        this.$('.attachments').hide();
      }
    },
    reload: function(e) {
      var interval = setInterval(function() {
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
        if(allLoaded) { // all attachments loaded, or none with none in progress
          clearInterval(interval);
          this.load(false);
        } else if (oneLoaded) { // at least one attachment loaded
          this.load(true);
        } else { // none loaded, some in progress
          this.$('.attachments').html('');
          this.load(true);
        }
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
    },
    // simple buttons
    insertBold: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '**{bold}**';
      this.pasteComment(markdown);
    },
    insertItalic: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '*{italic}*';
      this.pasteComment(markdown);
    },
    insertUnordered: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '\n* {item}\n* {item}\n* {item}';
      this.pasteComment(markdown);
    },
    insertOrdered: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '\n1. {item1}\n2. {item2}\n3. {item3}\n';
      this.pasteComment(markdown);
    },
    // insertNest: function(e) {
    //   if(e) {e.preventDefault();}
    //   var markdown = '  ';
    //   this.pasteComment(markdown);
    // },
    insertBreak: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '---\n';
      this.pasteComment(markdown);
    },
    insertBlockQuote: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '\n> {quote}\n> {quote}';
      this.pasteComment(markdown);
    },
    insertInlineCode: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '`{code}`';
      this.pasteComment(markdown);
    },
    insertCodeBlock: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '```\n{code}\n```';
      this.pasteComment(markdown);
    },
    insertH1: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '# {header}';
      this.pasteComment(markdown);
    },
    insertH2: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '## {header}';
      this.pasteComment(markdown);
    },
    insertH3: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '### {header}';
      this.pasteComment(markdown);
    },
    insertH4: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '#### {header}';
      this.pasteComment(markdown);
    },
    insertH5: function(e) {
      if(e) {e.preventDefault();}
      var markdown = '##### {header}';
      this.pasteComment(markdown);
    },
    pasteComment: function(markdown) {
      // copies the existing comment, appends two line breaks and the markdown, then sets the comment
      console.log('Adding: ' + markdown);
      var existingComment = this.comment().text();
      if (!existingComment) {
        this.comment().text(markdown);
      } else {
        this.comment().text(existingComment + '\n\n' + markdown);
      }
    },
    clearComment: function(e) {
      if(e) {e.preventDefault();}
      this.comment().text('');
    }
  };
}());