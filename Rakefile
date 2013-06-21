namespace :js do
	desc 'Compile Javascript, pmts => c: Compress'
	task :compile, :pmts do |t, args|
		require 'sprockets'
		require 'uglifier'

		args.with_defaults(pmts: '')
		
		environment = Sprockets::Environment.new
		environment.append_path 'core/classes'
		environment.append_path 'js'

		file_content = environment.find_asset('manifest.js').to_s
		file_content = Uglifier.compile(file_content, comments: :none) if args[:pmts].index('c')

		File.open('js/dbdesigner.js', 'w') do |f|
			f.write(file_content)
		end
	end
end

namespace :css do
	desc 'Compile Sass, pmts => c: Compress, f: Force'
	task :compile, :pmts do |t, args|
		require 'compass'
		require 'compass/exec'

		args.with_defaults(pmts: '')

		params = ['compile', '--css-dir', 'css', '--sass-dir', 'sass', '--images-dir', 'images']

		params.push('--output-style', 'compressed') if args[:pmts].index('c')

		params.push('--force') if args[:pmts].index('f')

		Compass::Exec::SubCommandUI.new(params).run!

	end
end


namespace :assets do
	desc 'Compile Assets, pmts => c: Compress, f: Force'
	task :compile, :pmts do |t, args|
		args.with_defaults(pmts: 'cf')
		Rake::Task['js:compile'].invoke(args[:pmts])
		Rake::Task['css:compile'].invoke(args[:pmts])
	end
end

task :default => ['assets:compile']
